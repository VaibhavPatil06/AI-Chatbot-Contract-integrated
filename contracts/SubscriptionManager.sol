// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SubscriptionManager
 * @dev Manages blockchain-based subscriptions for AI Chat Pro
 * @notice This contract handles subscription plans, billing, and query deductions
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SubscriptionManager is Ownable, ReentrancyGuard, Pausable {
    
    // Enums
    enum PlanType { BASIC, PREMIUM, ENTERPRISE }
    enum BillingType { MONTHLY, YEARLY }
    enum SubscriptionStatus { INACTIVE, ACTIVE, EXPIRED, CANCELLED }

    // Structs
    struct Plan {
        uint256 monthlyPrice;
        uint256 yearlyPrice;
        uint256 monthlyQueries;
        string name;
        bool active;
    }

    struct Subscription {
        address subscriber;
        PlanType plan;
        BillingType billingType;
        uint256 startDate;
        uint256 expirationDate;
        uint256 queriesRemaining;
        uint256 queriesUsed;
        SubscriptionStatus status;
        uint256 autoRenewCount;
    }

    // State variables
    mapping(address => Subscription) public subscriptions;
    mapping(uint8 => Plan) public plans;
    mapping(address => bool) public admin;
    
    uint256 public totalRevenue;
    uint256 public totalSubscribers;
    address public treasuryAddress;

    // Events
    event SubscriptionCreated(
        address indexed subscriber,
        PlanType indexed plan,
        BillingType indexed billingType,
        uint256 expirationDate,
        uint256 amount
    );

    event SubscriptionCancelled(
        address indexed subscriber,
        uint256 cancelledAt
    );

    event SubscriptionRenewed(
        address indexed subscriber,
        uint256 newExpirationDate,
        uint256 amount
    );

    event QueryDeducted(
        address indexed subscriber,
        uint256 queriesRemaining,
        uint256 queriesUsed
    );

    event PlanUpdated(uint8 indexed planId, uint256 monthlyPrice, uint256 yearlyPrice);

    // Modifiers
    modifier onlyAdmin() {
        require(admin[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier onlySubscriber(address _subscriber) {
        require(
            msg.sender == _subscriber || admin[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    modifier subscriptionActive(address _subscriber) {
        Subscription memory sub = subscriptions[_subscriber];
        require(
            sub.status == SubscriptionStatus.ACTIVE &&
            block.timestamp <= sub.expirationDate,
            "Subscription not active"
        );
        _;
    }

    // Constructor
    constructor(address _treasury) {
        treasuryAddress = _treasury != address(0) ? _treasury : msg.sender;
        admin[msg.sender] = true;

        // Initialize default plans (prices in wei)
        // Basic: 0.01 ETH/month, 0.1 ETH/year, 100 queries/month
        plans[0] = Plan(0.01 ether, 0.1 ether, 100, "Basic", true);
        
        // Premium: 0.05 ETH/month, 0.5 ETH/year, 500 queries/month
        plans[1] = Plan(0.05 ether, 0.5 ether, 500, "Premium", true);
        
        // Enterprise: 0.2 ETH/month, 2.0 ETH/year, unlimited queries
        plans[2] = Plan(0.2 ether, 2.0 ether, type(uint256).max, "Enterprise", true);
    }

    // Admin functions
    function setAdmin(address _admin, bool _isAdmin) external onlyOwner {
        admin[_admin] = _isAdmin;
    }

    function setTreasuryAddress(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasuryAddress = _treasury;
    }

    function updatePlan(
        uint8 _planId,
        uint256 _monthlyPrice,
        uint256 _yearlyPrice,
        uint256 _monthlyQueries,
        string memory _name
    ) external onlyAdmin {
        require(_planId < 3, "Invalid plan ID");
        plans[_planId].monthlyPrice = _monthlyPrice;
        plans[_planId].yearlyPrice = _yearlyPrice;
        plans[_planId].monthlyQueries = _monthlyQueries;
        plans[_planId].name = _name;
        emit PlanUpdated(_planId, _monthlyPrice, _yearlyPrice);
    }

    function pauseContract() external onlyOwner {
        _pause();
    }

    function unpauseContract() external onlyOwner {
        _unpause();
    }

    // Subscription management functions
    function subscribe(
        uint8 _planId,
        bool _isYearly
    ) external payable nonReentrant whenNotPaused {
        require(_planId < 3, "Invalid plan ID");
        require(plans[_planId].active, "Plan not active");

        Plan memory plan = plans[_planId];
        uint256 amount = _isYearly ? plan.yearlyPrice : plan.monthlyPrice;

        require(msg.value >= amount, "Insufficient payment");

        Subscription memory currentSub = subscriptions[msg.sender];
        
        // If already has active subscription, treat as renewal/upgrade
        if (currentSub.status == SubscriptionStatus.ACTIVE && block.timestamp <= currentSub.expirationDate) {
            // Calculate prorated refund if upgrading
            uint256 timeRemaining = currentSub.expirationDate - block.timestamp;
            uint256 monthlyRate = _isYearly ? (plan.yearlyPrice / 12) : plan.monthlyPrice;
            uint256 refund = (currentSub.expirationDate - block.timestamp) / 30 days * monthlyRate;
            
            // Refund excess if paying more
            if (msg.value > amount) {
                (bool success, ) = msg.sender.call{value: msg.value - amount}("");
                require(success, "Refund failed");
            }
        } else if (msg.value > amount) {
            // Refund excess payment
            (bool success, ) = msg.sender.call{value: msg.value - amount}("");
            require(success, "Refund failed");
        }

        uint256 duration = _isYearly ? 365 days : 30 days;
        uint256 expirationDate = block.timestamp + duration;

        subscriptions[msg.sender] = Subscription({
            subscriber: msg.sender,
            plan: PlanType(_planId),
            billingType: _isYearly ? BillingType.YEARLY : BillingType.MONTHLY,
            startDate: block.timestamp,
            expirationDate: expirationDate,
            queriesRemaining: plan.monthlyQueries,
            queriesUsed: 0,
            status: SubscriptionStatus.ACTIVE,
            autoRenewCount: 0
        });

        if (currentSub.status != SubscriptionStatus.ACTIVE) {
            totalSubscribers++;
        }

        totalRevenue += amount;

        // Transfer payment to treasury
        (bool success, ) = treasuryAddress.call{value: amount}("");
        require(success, "Payment transfer failed");

        emit SubscriptionCreated(msg.sender, PlanType(_planId), _isYearly ? BillingType.YEARLY : BillingType.MONTHLY, expirationDate, amount);
    }

    function cancelSubscription(address _subscriber) external onlySubscriber(_subscriber) nonReentrant {
        Subscription storage sub = subscriptions[_subscriber];
        require(sub.status == SubscriptionStatus.ACTIVE, "Subscription not active");

        sub.status = SubscriptionStatus.CANCELLED;
        sub.expirationDate = block.timestamp;
        totalSubscribers--;

        emit SubscriptionCancelled(_subscriber, block.timestamp);
    }

    function autoRenewSubscription(address _subscriber) external payable nonReentrant {
        Subscription storage sub = subscriptions[_subscriber];
        require(sub.status == SubscriptionStatus.ACTIVE, "Subscription not active");
        require(block.timestamp > sub.expirationDate, "Subscription not expired");

        Plan memory plan = plans[uint8(sub.plan)];
        uint256 amount = sub.billingType == BillingType.YEARLY ? plan.yearlyPrice : plan.monthlyPrice;

        require(msg.value >= amount, "Insufficient payment");

        uint256 duration = sub.billingType == BillingType.YEARLY ? 365 days : 30 days;
        sub.expirationDate = block.timestamp + duration;
        sub.status = SubscriptionStatus.ACTIVE;
        sub.queriesRemaining = plan.monthlyQueries;
        sub.queriesUsed = 0;
        sub.autoRenewCount++;

        totalRevenue += amount;

        if (msg.value > amount) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - amount}("");
            require(refundSuccess, "Refund failed");
        }

        (bool success, ) = treasuryAddress.call{value: amount}("");
        require(success, "Payment transfer failed");

        emit SubscriptionRenewed(_subscriber, sub.expirationDate, amount);
    }

    // Query management
    function deductQueries(address _subscriber, uint256 _queryCount) external onlyAdmin subscriptionActive(_subscriber) {
        Subscription storage sub = subscriptions[_subscriber];

        if (sub.plan != PlanType.ENTERPRISE) {
            require(sub.queriesRemaining >= _queryCount, "Insufficient query quota");
            sub.queriesRemaining -= _queryCount;
        }

        sub.queriesUsed += _queryCount;

        emit QueryDeducted(_subscriber, sub.queriesRemaining, sub.queriesUsed);
    }

    function refundQueries(address _subscriber, uint256 _queryCount) external onlyAdmin {
        Subscription storage sub = subscriptions[_subscriber];
        if (sub.plan != PlanType.ENTERPRISE) {
            sub.queriesRemaining += _queryCount;
        }
        if (sub.queriesUsed >= _queryCount) {
            sub.queriesUsed -= _queryCount;
        }
    }

    // View functions
    function getSubscription(address _subscriber) external view returns (Subscription memory) {
        return subscriptions[_subscriber];
    }

    function isSubscriptionActive(address _subscriber) external view returns (bool) {
        Subscription memory sub = subscriptions[_subscriber];
        return sub.status == SubscriptionStatus.ACTIVE && block.timestamp <= sub.expirationDate;
    }

    function getQueriesRemaining(address _subscriber) external view returns (uint256) {
        Subscription memory sub = subscriptions[_subscriber];
        if (sub.plan == PlanType.ENTERPRISE || sub.status != SubscriptionStatus.ACTIVE) {
            return sub.plan == PlanType.ENTERPRISE ? type(uint256).max : 0;
        }
        return sub.queriesRemaining;
    }

    function getPlanInfo(uint8 _planId) external view returns (Plan memory) {
        require(_planId < 3, "Invalid plan ID");
        return plans[_planId];
    }

    function getContractStats() external view returns (
        uint256 totalSubs,
        uint256 revenue,
        uint256 treasuryBalance
    ) {
        return (totalSubscribers, totalRevenue, address(this).balance);
    }

    function hasActiveSubscription(address _subscriber) external view returns (bool) {
        Subscription memory sub = subscriptions[_subscriber];
        return sub.status == SubscriptionStatus.ACTIVE && block.timestamp <= sub.expirationDate;
    }

    // Fallback to receive ETH
    receive() external payable {}
}
