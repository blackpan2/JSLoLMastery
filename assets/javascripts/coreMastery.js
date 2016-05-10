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

function FormatNumberBy3Loop() {
    var formatList = document.getElementsByClassName("formatNumber3");
    for (var i = 0; i < formatList.length; i++) {
        document.getElementsByClassName("formatNumber3")[i].innerHTML =
            FormatNumberBy3(formatList[i].innerHTML);
    }
}

function showAll() {
    $('.restrict-all').show()
}

function hideAll() {
    $('.restrict-all').hide()
}

function show0() {
    hideAll();
    $('.restrict-0').show()
}

function show1() {
    hideAll();
    $('.restrict-1').show()
}

function show2() {
    hideAll();
    $('.restrict-2').show()
}

function show3() {
    hideAll();
    $('.restrict-3').show()
}

function show4() {
    hideAll();
    $('.restrict-4').show()
}

function show5() {
    hideAll();
    $('.restrict-5').show()
}
