/// <reference path="../typings/chrome/chrome.d.ts"/>
/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="URL.d.ts"/>

class RegisterSI
{
    protected imgRegex:RegExp = new RegExp('<img[^>]+src="([^">]+\.(?:jpg|gif|png))"', 'gi');

    load():void
    {
    	this.getCurrentTabUrl((url:string) => 
	    {
	        var domain = this.getDomainFromUrl(url);
	        if(domain)
	        {
	            $('#domain').val(domain);
	        }
	        this.reloadCaptcha();
	    });

        $('.more-information').on('click', () =>
        {
            $('#results, #available').hide();
            $('#about').slideDown();

            return false;
        });

	    $('#search').on('submit', () =>
	    {
	        $('#available, #captcha-code-error, #domain-error, #results').hide();
            $('#about').slideUp();

	        var domain:string = this.validateDomain($('#domain').val());
	        if(domain)
	        {
	            $('#loading').show();
	            this.doWhois(domain);            
	        }
	        else
	        {
	            $('#domain-error').show();
	        }

	        return false;
	    });
    }

	protected getCurrentTabUrl(callback:(url:string) => void):void
	{
	    var queryInfo = {
	        active: true,
	        currentWindow: true
	    };

	    chrome.tabs.query(queryInfo, (tabs) =>
	    {
	        var tab = tabs[0];
	        var url = tab.url;
	        console.assert(typeof url == 'string', 'tab.url should be a string');

	        callback(url);
	    });
	}

	protected getDomainFromUrl(domain:string):string
	{
	    // www.register.si > register.si OR subdomain.register.si > register.si
	    var domain:string = new URL(domain).hostname;
	    if(!domain)
	    {
	        return null;
	    }

	    var parts:string[] = domain.split('.');
	    if(parts.length < 2)
	    {
	        return null;
	    }

	    if(parts[parts.length-1] !== 'si')
	    {
	        return null;
	    }

	    return parts[parts.length-2]; // also subdomain if not www
	}

	protected validateDomain(domain:string):string
	{
	    domain = $.trim(domain);
	    if(!domain.length)
	    {
	        return null;
	    }

	    // contains valid symbols [a-zA-Z0-9] + šumniki
	    return domain;
	}

	protected reloadCaptcha():void
	{
        $('#captcha-code').val('')
		$('#captcha').attr('src', 'http://www.register.si/index.php?eID=sr_freecap_captcha&id=695');
	}

	protected doWhois(domain:string):void
	{
	    var data = {'domain': domain, 'captcha': $('#captcha-code').val()};
	    $.post('http://www.register.si/whois.html?no_cache=1', data, (html:string) =>
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
	            html = html.replace(this.imgRegex, '');
	            var $html = $(html);
	            var table = $('.tx-restwhois-pi1 > table', $html).html();
	            $('#results').html(table).show();
	        }

	        this.reloadCaptcha();
	        $('#loading').hide();
	    });
	}
}

document.addEventListener('DOMContentLoaded', () => 
{
	var registersi = new RegisterSI();
	registersi.load();
});