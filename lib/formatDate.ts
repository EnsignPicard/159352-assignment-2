/*
a helper function used to convert the dates from MongoDB atlas which are in utc to local timezone
using the tz (timezone) parameter. we also have style parameter where short is used for the search results
and long for the invoice page as it looks more formal

 */

export function formatDate(dateStr: string, tz: string, style: "short" | "long" = "short") {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-NZ", {
        weekday: style,
        year: "numeric",
        month: style,
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: tz,
        timeZoneName: "short",
    }).format(date);
}