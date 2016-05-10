var express = require('express');
var LolApi = require('leagueapi');
var moment = require("moment");

var router = express.Router();

LolApi.init(process.env.DEV_KEY, 'na');
// LolApi.setRateLimit(1500, 90000);
LolApi.setRateLimit(10, 500);

router.get('/', function (req, res) {
    res.render('index', {title: 'League Mastery'});
});

router.post('/', function (req, res) {
    res.status(302).redirect("/summoner=" + req.body.summoner);
});

function FormatNumberBy3(num) {
    // check for missing parameters and use defaults if so
    var sep = ",";
    var decimal_point = ".";
    // need a string for operations
    num = num.toString();
    // separate the whole number and the fraction if possible
    var a = num.split(decimal_point);
    var x = a[0]; // decimal
    var y = a[1]; // fraction
    var z = "";
    if (typeof(x) != "undefined") {
        // reverse the digits. regexp works from left to right.
        for (var i = x.length - 1; i >= 0; i--)
            z += x.charAt(i);
        // add separators. but undo the trailing one, if there
        z = z.replace(/(\d{3})/g, "$1" + sep);
        if (z.slice(-sep.length) == sep)
            z = z.slice(0, -sep.length);
        x = "";
        // reverse again to get back the number
        for (i = z.length - 1; i >= 0; i--)
            x += z.charAt(i);
        // add the fraction back in, if it was there
        if (typeof(y) != "undefined" && y.length > 0)
            x += decimal_point + y;
    }
    return x;
}

function merge_options(obj1, obj2) {
    var obj3 = {};
    for (var attrName1 in obj1) {
        obj3[attrName1] = obj1[attrName1];
    }
    for (var attrName2 in obj2) {
        obj3[attrName2] = obj2[attrName2];
    }
    return obj3;
}

function compare(a, b) {
    if (a.championPoints > b.championPoints) return -1;
    else if (a.championPoints < b.championPoints) return 1;
    else if (a.championPoints == b.championPoints) {
        if (a.key > b.key) return -1;
        else if (a.key < b.key) return 1;
    }
    else return 0;
}

router.get('/summoner=:summoner', function (req, res) {
    var masteryData = [];
    var tempMastery = [];
    var tempChampions = [];
    LolApi.Summoner.getByName(req.params.summoner).then(function (summoner) {
        summoner = summoner[Object.keys(summoner)[0]];
        var str = summoner.name;
        var first = str.slice(0, 1).toUpperCase();
        var second = str.slice(1).toLowerCase();
        summoner.name = first + second;
        summoner.iconURL = 'http://ddragon.leagueoflegends.com/cdn/6.9.1/img/profileicon/' + summoner.profileIconId + '.png';
        LolApi.ChampionMastery.getChampions(summoner.id).then(function (mastery) {
            tempMastery = mastery;
            for (var mast in tempMastery) {
                tempMastery[mast]['masteryPicture'] = "/images/tier" + tempMastery[mast]['championLevel'] + ".png";
                tempMastery[mast]['lastPlayTime'] = moment(tempMastery[mast]['lastPlayTime']).format("MMM DD YYYY, h:mm a");
            }
        }).then(function () {
            var options = {champData: 'lore', locale: 'en_US'};
            LolApi.Static.getChampionList(options).then(function (championList) {
                // console.log(Object.keys(championList.data));
                tempChampions = Object.keys(championList.data).map(function (key) {
                    return championList.data[key]
                });
                for (var champ in tempChampions) {
                    tempChampions[champ]['championPicture'] = "http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/"
                        + tempChampions[champ].key + ".png";
                }
            }).then(function () {
                for (var i = 0; i < tempChampions.length; i++) {
                    for (var j = 0; j < tempMastery.length; j++) {
                        if (tempChampions[i].id === tempMastery[j].championId) {
                            masteryData.push(merge_options(tempChampions[i], tempMastery[j]));
                        }
                    }
                }
                masteryData = masteryData.sort(compare);
                // console.log(summoner);
                console.log(masteryData);
                res.render('mastery', {title: 'League Mastery', summoner: summoner, mastery: masteryData});
            });
        });
    });
});


module.exports = router;

//
// function FormatNumberBy3Loop() {
//     var formatList = document.getElementsByClassName("formatNumber3");
//     for (var i = 0; i < formatList.length; i++) {
//         document.getElementsByClassName("formatNumber3")[i].innerHTML =
//             FormatNumberBy3(formatList[i].innerHTML);
//     }
// }
//
// function championPicture() {
//     var allChamps = document.getElementsByClassName("championPicture");
//     for (var i = 0; i < allChamps.length; i++) {
//         var name = allChamps[i].alt;
//         document.getElementsByClassName("championPicture")[i].src = setChampionPicture(name);
//     }
// }
//
// function setChampionPicture(name) {
//     return "http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/".concat(name).concat(".png");
// }
//
// function masteryIcon() {
//     var allLevels = document.getElementsByClassName("mastery-icon");
//     for (var i = 0; i < allLevels.length; i++) {
//         var numeric = allLevels[i].alt;
//         document.getElementsByClassName("mastery-icon")[i].src = "/static/images/tier" + numeric + ".png";
//     }
// }
//

