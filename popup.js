function getCurrentTabUrl(callback) 
{
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) 
    {
        var tab = tabs[0];
        var url = tab.url;
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
    });
}

function getDomainFromUrl(domain)
{
    // www.register.si > register.si OR subomain.register.si > register.si
    var domain = new URL(domain).hostname;
    if(!domain)
    {
        return null;
    }

    var parts = domain.split('.');
    if(parts.length < 2)
    {
        return null;
    }

    if(parts[parts.length-1] !== 'si')
    {
        return null;
    }
    
    return parts[parts.length-2];
}

function validateDomain(domain)
{
    domain = $.trim(domain);
    if(domain.length === 0)
    {
        return null;
    }

    // contains valid symbols [a-zA-Z0-9] + šumniki

    return domain;
}

var imgRegex = new RegExp('<img[^>]+src="([^">]+\.(?:jpg|gif|png))"', 'gi');
var captchaRegex = new RegExp('<img(?=[^>]+class="tx-srfreecap-pi2-image")[^>]+src="([^">]+)', 'gi');
var captchaURL = null;

function reloadCaptcha()
{
    $('#captcha').attr('src', captchaURL);
}

function doWhois(domain)
{
    var data = {'domain': domain, 'captcha': $('#captcha-code').val()};
    $.post('http://www.register.si/whois.html?no_cache=1', data, function(html)
    {
        if(html.indexOf('Domena ni registrirana') > -1)
        {
          $('#available').show();
        }
        else if(html.indexOf('Napačna koda') > -1)
        {
          $('#captcha-code-error').show();
        }
        else
        {
            html = html.replace(/typo3conf\/ext\/restwhois\/pi1\/picture\.php\?/g, 'http://www.register.si/typo3conf/ext/restwhois/pi1/picture.php?');
            html = html.replace(imgRegex, '');
            var $html = $(html);
            var table = $('.tx-restwhois-pi1 > table', $html).html();
            $('#results').html(table);
        }

        reloadCaptcha();
        $('#loading').hide();
        $('#captcha-code').val('')
    });
}

function fetchPage()
{
    $.get('http://www.register.si/whois.html?no_cache=1', function(html)
    {
        captchaURL = captchaRegex.exec(html)[1];
        $('#captcha').attr('src', captchaURL);
    });
}

document.addEventListener('DOMContentLoaded', function() 
{
    $('#search').on('submit', function()
    {
        $('#available, #captcha-code-error, #domain-error').hide();
        $('#results').html('');

        var domain = validateDomain($('#domain').val());
        if(domain)
        {
            $('#loading').show();
            doWhois(domain);            
        }
        else
        {
            $('#domain-error').show();
        }

        return false;
    });

    getCurrentTabUrl(function(url) 
    {
        var domain = getDomainFromUrl(url);
        if(domain)
        {
            $('#domain').val(domain);
        }
        fetchPage();
    });
});
