# gatsby-plugin-utm

Automatically captures first and last UTM paramters of your site visitors. Easily retrieve them to fill hidden form fields.

## Install

`yarn add gatsby-plugin-utm`

or

`npm install --save gatsby-plugin-utm`

## How to use

1. Include the plugin in your `gatsby-config.js` file.

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-utm`,
    options: {
      utmParams: [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content"
      ],
      cookieExpiryDays: 365
    }
  }
];
```

2. Import and run captureAndStoreUtmParams function on all or individual pages

```javascript
// in /src/components/seo.js to run on all pages or individual pages UTMs will be captured
import  { captureAndStoreUtmParams } from "gatsby-plugin-utm"

// collects and stores UTMs in browser cookie
captureAndStoreUtmParams()

```

3. Retrieve and use on any page

```javascript
// any page UTMs will be retrieved and used
import  { getUtmValuesFromCookie } from "gatsby-plugin-utm"


// retrieves and returns first touch and last touch cookies from cookies
const UtmValues = getUtmValuesFromCookie()

```


First Touch Cookies:
```
__ft_referrer			
__ft_utm_campaign			
__ft_utm_content			
__ft_utm_medium			
__ft_utm_source			
__ft_utm_term
```

Last Touch Cookies:		
```	
__lt_referrer			
__lt_utm_campaign			
__lt_utm_content			
__lt_utm_medium			
__lt_utm_source			
__lt_utm_term
```
