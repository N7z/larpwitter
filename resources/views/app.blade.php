<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0ea5e9">

    <script>
        (function () {
            var appearance = localStorage.getItem('appearance');
            if (appearance === 'dark') {
                document.documentElement.classList.add('dark');
            }
        })();
    </script>

    @php
        $appName = config('app.name', 'Larpwitter');
        $seoTitle = $seo['title'] ?? null;
        $seoDescription = $seo['description'] ?? 'Larpwitter is a social feed for larpers to post and follow the rest of the community.';
        $seoImage = $seo['image'] ?? asset('favicon.png');
        $seoCard = $seo['card'] ?? 'summary';
        $seoNoindex = $seo['noindex'] ?? false;
    @endphp

    <title inertia>{{ $seoTitle ? "{$seoTitle} - {$appName}" : $appName }}</title>
    <meta name="description" content="{{ $seoDescription }}">
    <meta name="robots" content="{{ $seoNoindex ? 'noindex, nofollow' : 'index, follow' }}">
    <link rel="canonical" href="{{ url()->current() }}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ $appName }}">
    <meta property="og:title" content="{{ $seoTitle ?? $appName }}">
    <meta property="og:description" content="{{ $seoDescription }}">
    <meta property="og:image" content="{{ $seoImage }}">
    <meta property="og:url" content="{{ url()->current() }}">

    <meta name="twitter:card" content="{{ $seoCard }}">
    <meta name="twitter:title" content="{{ $seoTitle ?? $appName }}">
    <meta name="twitter:description" content="{{ $seoDescription }}">
    <meta name="twitter:image" content="{{ $seoImage }}">

    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/favicon.png">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="min-h-screen bg-white antialiased dark:bg-gray-950">
    @inertia
</body>
</html>
