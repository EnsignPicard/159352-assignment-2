export function formatDate(dateStr: string, tz: string, style: "short" | "long" = "short") {
    const date = new Date(dateStr);
    if (style === "long") {
        return new Intl.DateTimeFormat("en-NZ", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: tz,
            timeZoneName: "short",
        }).format(date);
    }
    return new Intl.DateTimeFormat("en-NZ", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: tz,
        timeZoneName: "short",
    }).format(date);
}