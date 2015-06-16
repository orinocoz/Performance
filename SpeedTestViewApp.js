angular.module('SpeedTestViewApp', ['SpeedTestViewModule', 'ngDialog'])

.service('SpeedTestService', function(){
    var translations = httpGet('./settings.txt');
    this.Translations = translations.status == 200 ? JSON.parse(translations.responseText).translations : {};
    this.SiteUrl = translations.status == 200 ? JSON.parse(translations.responseText).siteURL : "";
    var result = httpGet('/speedtest.txt');
	if (result.status == 200) {
        var speedResults = JSON.parse(result.responseText);
    	this.SpeedTestResults = SortRuleResultsByImpact(speedResults);
	} else {
		alert('Failed to get speed test data!');
	}

    this.GetKeys = GetKeys;

    function SortRuleResultsByImpact(speedResults) {
        for (var resultsKey in speedResults) {
            if (speedResults[resultsKey] != null) {
                // profiles mobile/desktop
                for (var profileKey in speedResults[resultsKey]) {
                    // websiteKey example 'http://www.google.com/'
                    for (var websiteKey in speedResults[resultsKey][profileKey]) {
                        var sortedRules = {};
                        // if object is not from google speed insights
                        if (speedResults[resultsKey][profileKey][websiteKey].formattedResults !== undefined) {
                            // ruleKey example 'AvoidLandingPageRedirects'
                            var ruleKeys = GetKeys(speedResults[resultsKey][profileKey][websiteKey].formattedResults.ruleResults);
                            for (var j = 0; j < ruleKeys.length; j++) {
                                var max = undefined;
                                for (var i = 0; i < ruleKeys.length; i++) {
                                    if (max === undefined || speedResults[resultsKey][profileKey][websiteKey].formattedResults.ruleResults[ruleKeys[i]] !== undefined && max.value !== undefined
                                        && max.value.ruleImpact <= speedResults[resultsKey][profileKey][websiteKey].formattedResults.ruleResults[ruleKeys[i]].ruleImpact) {
                                        max = { key: ruleKeys[i], value: speedResults[resultsKey][profileKey][websiteKey].formattedResults.ruleResults[ruleKeys[i]] };
                                    }
                                };
                                sortedRules[max.key] = max.value;
                                delete speedResults[resultsKey][profileKey][websiteKey].formattedResults.ruleResults[max.key];
                            }
                            speedResults[resultsKey][profileKey][websiteKey].formattedResults.ruleResults = sortedRules;
                        }
                    }
                }
            }
        }
        return speedResults;
    }

    function GetKeys(object) {
        var keys = [];
        for (var key in object) {
            keys.push(key);
        }
        return keys;
    };

    function httpGet(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false );
        xmlHttp.send( null );
        return xmlHttp;
    }
})

.config([function(){
  // console.log('Configuration');
}])

.run([function(){
  // console.log('Run');
}]);