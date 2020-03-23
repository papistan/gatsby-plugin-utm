const settings = {
  cookieNameFirstTouchPrefix: "__ft_",
  cookieNamePrefix: "__lt_",
  utmParams: [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content"
  ],
  cookieExpiryDays: 365,
  isFirstTouch: null
};

exports.onPreInit = (_, pluginOptions) => {
  settings.utmParam = pluginOptions.message || settings.utmParam;
  settings.cookieExpiryDays =
    pluginOptions.cookieExpiryDays || settings.cookieExpiryDays;
};

// parse URL and properly store any UTM parameters
export function captureAndStoreUtmParams() {
  // check for doNotTrack and abort if present
  if (window.doNotTrack || navigator.doNotTrack) {
    // The browser supports Do Not Track!
    if (
      window.doNotTrack == "1" ||
      navigator.doNotTrack == "yes" ||
      navigator.doNotTrack == "1"
    ) {
      console.log("Do not track is on");
      return;
    }
  }

  base.storeParamsInCookies();
}

// retrieve and return UTM parameters from cookies
export function getUtmValuesFromCookie() {
  let ca = document.cookie.split(";");
  let utmObject =
    ca &&
    ca.reduce((utmKeyValues, c) => {
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      let utmKeyAndValue = c.split("=");
      utmKeyValues[utmKeyAndValue[0]] = utmKeyAndValue[1];
      return utmKeyValues;
    }, {});
  return utmObject;
}

var utils = {
  topDomain: function() {
    var i,
      h,
      top_level_cookie = "top_level_domain=cookie",
      hostname = document.location.hostname.split(".");
    for (i = hostname.length - 1; i >= 0; i--) {
      h = hostname.slice(i).join(".");
      document.cookie = top_level_cookie + ";domain=." + h + ";";
      if (document.cookie.indexOf(top_level_cookie) > -1) {
        document.cookie =
          top_level_cookie.split("=")[0] +
          "=;domain=." +
          h +
          ";expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        return h;
      }
    }
    return document.location.hostname;
  },
  isFirstTouch: function() {
    if (settings.isFirstTouch != null) return settings.isFirstTouch;
    else {
      var f =
        document.cookie.indexOf(settings.cookieNameFirstTouchPrefix) === -1;
      console.log("first touch: " + f);
      settings.isFirstTouch = f;
      return f;
    }
  },
  isNewSession: function() {
    var c = "__utm_tracking_session";
    var r = cookies.read(c) === undefined;
    cookies.create(c, true, 1 / 48);
    return r;
  }
};

var cookies = {
  create: function(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      var expires = "; expires=" + date.toGMTString();
    } else var expires = "";

    var c =
      name +
      "=" +
      value +
      expires +
      "; domain=." +
      utils.topDomain() +
      "; path=/";

    document.cookie = c;
  },
  writeCookieOnce: function(name, value) {
    if (utils.isFirstTouch()) {
      this.create(
        settings.cookieNameFirstTouchPrefix + name,
        value,
        settings.cookieExpiryDays
      );
    }
    this.create(
      settings.cookieNamePrefix + name,
      value,
      settings.cookieExpiryDays
    );
  },
  read: function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
  },
  erase: function(name) {
    this.createCookie(name, "", -1);
  }
};

var base = {
  getParameterByName: function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null) {
      return "";
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  },
  utmPresentInUrl: function() {
    for (var i = 0; i < settings.utmParams.length; i++) {
      var param = settings.utmParams[i];
      var value = this.getParameterByName(param);
      if (value !== "" && value !== undefined) {
        return true;
      }
    }
    return false;
  },
  writeUtmCookieFromParams: function() {
    if (this.utmPresentInUrl()) {
      for (var i = 0; i < settings.utmParams.length; i++) {
        var param = settings.utmParams[i];
        var value = this.getParameterByName(param);
        cookies.writeCookieOnce(param, value);
      }
    }
  },
  writeReferrer: function() {
    var value = document.referrer;
    var key = "referrer";
    if (
      value &&
      value !== "" &&
      value !== undefined &&
      value.indexOf(document.location.host) === -1
    ) {
      cookies.writeCookieOnce(key, value);
    } else {
      cookies.writeCookieOnce(key, "direct");
    }
  },
  storeParamsInCookies: function() {
    if (utils.isNewSession()) {
      this.writeUtmCookieFromParams();
      this.writeReferrer();
    }
  }
};
