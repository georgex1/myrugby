var admobid = {};

function initAdMob(){
    initAds();
}

function adMobBannerShow(){
    if (window.cordova) {
        admob.createBannerView();
    }
}

var isAppForeground = true;

function initAds() {
    if (admob) {
        var adPublisherIds = {
            ios : {
                banner: 'ca-app-pub-2183380957009421/3111531395',
                interstitial: 'ca-app-pub-2183380957009421/8310663398'
            },
            android : {
                banner: 'ca-app-pub-2183380957009421/3111531395',
                interstitial: 'ca-app-pub-2183380957009421/8310663398'
            }
        };

        var admobid = (/(android)/i.test(navigator.userAgent)) ? adPublisherIds.android : adPublisherIds.ios;

        admob.setOptions({
            publisherId:      admobid.banner,
            interstitialAdId: admobid.banner
        });

        registerAdEvents();

    } else {
        l('AdMobAds plugin not ready');
    }
}

function onAdLoaded(e) {
    if (isAppForeground) {
        if (e.adType === admob.AD_TYPE.INTERSTITIAL) {
            l("An interstitial has been loaded and autoshown. If you want to load the interstitial first and show it later, set 'autoShowInterstitial: false' in admob.setOptions() and call 'admob.showInterstitialAd();' here");
        } else if (e.adType === admob.AD_TYPE_BANNER) {
            l("New banner received");
        }
    }
}

function registerAdEvents() {
    document.addEventListener(admob.events.onAdLoaded, onAdLoaded);
    document.addEventListener(admob.events.onAdFailedToLoad, function (e) {});
    document.addEventListener(admob.events.onAdOpened, function (e) {});
    document.addEventListener(admob.events.onAdClosed, function (e) {});
    document.addEventListener(admob.events.onAdLeftApplication, function (e) {});
    document.addEventListener(admob.events.onInAppPurchaseRequested, function (e) {});
}