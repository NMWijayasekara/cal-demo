interface EventType {
    id: number;
    title: string;
    slug: string;
    length: number;
    hidden: boolean;
    position: number;
    userId: number;
    teamId: number | null;
    scheduleId: number;
    eventName: string | null;
    timeZone: string | null;
    periodType: 'UNLIMITED' | 'LIMITED';  // Assuming this can be either UNLIMITED or LIMITED, based on the provided data
    periodStartDate: string | null;
    periodEndDate: string | null;
    periodDays: number | null;
    periodCountCalendarDays: boolean | null;
    requiresConfirmation: boolean;
    recurringEvent: boolean | null;
    disableGuests: boolean;
    hideCalendarNotes: boolean;
    minimumBookingNotice: number;
    beforeEventBuffer: number;
    afterEventBuffer: number;
    schedulingType: string | null;
    price: number;
    currency: string;
    slotInterval: number | null;
    parentId: number | null;
    successRedirectUrl: string | null;
    description: string | null;
    locations: string[] | null;  // Assuming locations can be an array of strings, change if needed
    metadata: Record<string, any>;  // Metadata is an object with key-value pairs
    seatsPerTimeSlot: number | null;
    seatsShowAttendees: boolean;
    seatsShowAvailabilityCount: boolean;
    bookingFields: any[] | null;  // Assuming this is an array, adjust if more details are known
    bookingLimits: any[] | null;  // Assuming this is an array, adjust if more details are known
    onlyShowFirstAvailableSlot: boolean;
    durationLimits: any[] | null;  // Assuming this is an array, adjust if more details are known
    children: EventType[];  // Assuming children are of the same type as the parent
    hosts: any[];  // Assuming hosts is an array, adjust if more details are known
    customInputs: any[];  // Assuming customInputs is an array, adjust if more details are known
    link: string;
  }
  