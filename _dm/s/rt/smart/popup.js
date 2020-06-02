(function(global) {
    global.insiteScripts = global.insiteScripts || {};
    global.insiteScripts.popup =
        global.insiteScripts.popup ||
        function message(scriptOptions) {
            var dmSmartScriptDuration = scriptOptions.duration,
                dmSmartScriptSettings = scriptOptions.settings,
                dmSmartScriptRuleId = scriptOptions.ruleId,
                dmSmartScriptRuleType = scriptOptions.ruleType,
                isForced = scriptOptions.isForced;

            var getCookieName = function(popupName) {
                return '_dm_showed_' + popupName;
            };

            var shouldShowPopup = function(popupName) {
                return isForced || $.getCookie(getCookieName(popupName)) === null;
            };

            // If insite configured to show a popup then we don't want to show it everytime, once every "popup.insite.cookie.ttl" hours.
            var onClosePopup = function(popupName, event) {
                if (!isForced && (!window.Parameters || !window.Parameters.disableTracking))
                    $.setCookie(getCookieName(popupName), true, rtCommonProps['popup.insite.cookie.ttl']);
            };

            (function() {
                var settings = JSON.parse(atob(dmSmartScriptSettings));
                var popupName = settings.popupName;
                var delay = settings.delay;

                var options = {
                    onClose: onClosePopup.bind(null, popupName),
                    additionalAttributes: [
                        { name: 'data-rule', value: dmSmartScriptRuleId },
                        { name: 'data-rule-type', value: dmSmartScriptRuleType }
                    ]
                };

                if (popupName && shouldShowPopup(popupName)) {
                    setTimeout(function() {
                        $.dmrt.onLoad($.dmrt.components.popupService.displayPopup.bind(null, popupName, options));
                        if (window.dmsnowplow) {
                            dmsnowplow(
                                'trackStructEvent',
                                'insite',
                                'impression',
                                scriptOptions.ruleType,
                                scriptOptions.ruleId
                            );
                        }
                    }, (delay + dmSmartScriptDuration) * 1000);
                }
            })();
        };
})(this);
