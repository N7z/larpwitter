export default function Footer() {
    return (
        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-gray-400">
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4">
                <p>&copy; {new Date().getFullYear()} Larpwitter. Not affiliated with any social network, in or out of character.</p>
                <p>Made for larpers, by larpers.</p>
            </div>
        </footer>
    );
}
