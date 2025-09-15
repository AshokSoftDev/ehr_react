export const getUserTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const getCurrentTimestamp = (): number => {
    return Math.floor(Date.now() / 1000)
}

export const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString()
}
