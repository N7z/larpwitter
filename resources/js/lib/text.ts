export function excerpt(text: string, length = 160): string {
    const clean = text.replace(/\s+/g, ' ').trim();

    return clean.length > length ? `${clean.slice(0, length - 1).trimEnd()}…` : clean;
}
