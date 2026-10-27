<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="F.O.G.O. reúne inventário, mapa operacional e indicadores de risco para apoiar a gestão urbana.">
    <meta name="theme-color" content="#142c32">
    <link rel="icon" type="image/png" href="/images/fogo-logo.png">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>F.O.G.O. — Central de Operações</title>
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body><div id="app" data-page="{{ $page }}" data-mode="{{ config('fogo.mode') }}" data-user-name="{{ auth()->user()?->name }}"></div></body>
</html>
