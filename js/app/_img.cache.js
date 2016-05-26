function cache_images() {
    $('img').each(function() {
        ImgCache.cacheFile($(this).attr('src'));
    });
}

function use_cache() {
    $('img').each(function() {
        ImgCache.useCachedFile($(this));
    });
}

function use_online() {
    $('img').each(function() {
        ImgCache.useOnlineFile($(this));
    });
}


var reloadImages = function() {
    ImgCache.options.usePersistentCache = true;
    ImgCache.init();
};

if (typeof(cordova) !== 'undefined') {
    document.addEventListener('deviceready', reloadImages, false);
} else {
    $(document).ready(reloadImages);
}

//if(checkConnection()){ cache_images(); use_online(); } else { use_cache(); }