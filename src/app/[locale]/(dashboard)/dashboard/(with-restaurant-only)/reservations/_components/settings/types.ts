export interface TimeSlotOverride {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    blocked: boolean;
}

export interface RestaurantSettings {
    booking_interval_minutes: number;
    default_reservation_duration_minutes: number;
    small_party_duration: number;
    medium_party_duration: number;
    large_party_duration: number;
    use_tiered_duration: boolean;
    enable_table_combinations: boolean;
    enable_overbooking: boolean;
    overbooking_percentage: number;
}

export interface NotificationSettings {
    notifications_enabled: boolean;
    email_confirmation_enabled: boolean;
    email_24h_reminder_enabled: boolean;
    email_cancellation_enabled: boolean;
    sms_2h_reminder_enabled: boolean;
    reminder_time_24h: string;
    email_from_name: string;
    email_reply_to: string;
    email_confirmation_subject: string;
    email_confirmation_body: string;
    email_reminder_subject: string;
    email_reminder_body: string;
    sms_reminder_template: string;
    resend_api_key: string;
    test_mode: boolean;
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