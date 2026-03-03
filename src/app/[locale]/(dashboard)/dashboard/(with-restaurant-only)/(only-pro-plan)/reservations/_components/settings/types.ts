export interface TimeSlotOverride {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    blocked: boolean;
}

export interface RestaurantSettings {
    pause_new_reservations: boolean;
    emergency_closure: boolean;
    custom_message_for_customers: string;

    default_reservation_duration_minutes: number;
    small_party_duration: number;
    medium_party_duration: number;
    large_party_duration: number;
    use_tiered_duration: boolean;

    enable_table_combinations: boolean;
    enable_overbooking: boolean;
    overbooking_percentage: number;
}

export type OwnerNotificationTiming = "immediate" | "daily" | "custom";

export interface ReviewLinkInput {
    name: string;
    url: string;
}

export interface ReviewEmailSettings {
    enabled: boolean;
    email_subject: string;
    email_body: string;
    google_review_link: string;
    yelp_review_link: string;
    tripadvisor_review_link: string;
    other_review_links: ReviewLinkInput[];
}

export interface NotificationSettings {
    // configration 
    notifications_enabled: boolean;
    email_test_to: string;
    test_mode_passed: boolean;

    // templates 
    email_confirmation_subject: string;
    email_confirmation_body: string;

    email_reminder_subject: string;
    email_reminder_body: string;
    email_cancellation_subject: string;
    email_cancellation_body: string;

    // when to send 
    email_confirmation_enabled: boolean;
    email_24h_reminder_enabled: boolean;
    email_cancellation_enabled: boolean;

    // Management notifications
    owner_notifications_enabled: boolean;
    owner_emails: string[];
    owner_notify_new_bookings: boolean;
    owner_notify_cancellations: boolean;

    // Review request emails
    review_email: ReviewEmailSettings;
}

export type DepositType = "per-person" | "flat-rate";
export type RuleType = "day-of-week" | "time-slot" | "party-size" | "special-date";

export interface DynamicRule {
    id: number;
    ruleType: RuleType;
    depositType: DepositType;
    amount: string;
    priority: string;
    days?: string;
    startTime?: string;
    endTime?: string;
    minPartySize?: string;
    maxPartySize?: string;
    date?: string;
}

export interface CancellationPolicy {
    id: number;
    hoursBefore: string;
    refundPercentage: string;
    active: boolean;
}

export interface DepositSystemSettings {
    depositSystemEnabled: boolean;
    depositType: DepositType;
    depositAmount: string;
    depositCurrency: string;
    dynamicRules: DynamicRule[];
    cancellationPolicies: CancellationPolicy[];
}

export interface OverridesSettings {
    overrides_enabled: boolean;
    overrides: TimeSlotOverride[];
}

export interface SettingsState {
    overrides_settings: OverridesSettings;
    restaurantSettings: RestaurantSettings;
    notification_settings: NotificationSettings;
    deposit_settings: DepositSystemSettings;
}