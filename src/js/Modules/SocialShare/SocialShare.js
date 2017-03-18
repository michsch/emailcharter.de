import availableServices from './services';

const root = (typeof window === 'object' && window) || this;

class SocialShare {
  constructor (options) {
    this.options = Object.assign({}, this.getDefaults(), options);

    this._rootElement = document.querySelectorAll('[data-behavior="SocialShare"]')[0];
    this._services = this._createServices(availableServices);
    this._language = 'en';

    if (!this.options.useShariff) {
      const facebookJs = '//connect.facebook.net/en_US/sdk.js';
      const facebookUrlParameters = {
        xfbml: '1',
        version: 'v2.8',
        appId: this.options.facebookAppId
      };
      this.facebookUrl = this.createFacebookUrl(facebookJs, facebookUrlParameters);
      this.initFacebook();
    } else {
      this.createShariffList();
    }
  }

  initFacebook () {
    const facebookButton = document.getElementById(this.options.facebookButtonId);

    if (!facebookButton) {
      return;
    }

    facebookButton.onclick = this.loadFacebookCode.bind(this, facebookButton);
  }

  createFacebookUrl (facebookJs, facebookUrlParameters) {
    let facebookUrl = facebookJs;

    Object.keys(facebookUrlParameters).forEach((key) => {
      if (facebookUrl.indexOf('#') === -1) {
        facebookUrl += '#';
      } else {
        facebookUrl += '&';
      }

      facebookUrl += key + '=' + facebookUrlParameters[key];
    });

    return facebookUrl;
  }

  loadFacebookCode (facebookButton) {
    const facebookRootElement = this.getFacebookRootElement();
    const shareButton = this.getFacebookShareButton();
    const facebookId = 'facebook-jssdk';
    const body = document.getElementsByTagName('body')[0];
    const parent = facebookButton.parentNode;

    if (document.getElementById(facebookId)) {
      return;
    }

    body.insertBefore(facebookRootElement, body.firstChild);

    parent.innerHTML = '';
    parent.appendChild(shareButton);

    this.loadScript(this.facebookUrl).then( () => {
      console.log('LOADED!');
    });
  }

  getFacebookRootElement () {
    const rootElement = document.createElement('div');
    rootElement.id = 'fb-root';

    return rootElement;
  }

  getFacebookShareButton () {
    const button = document.createElement('div');
    button.className = 'fb-share-button';
    button.setAttribute('data-href', 'http://emailcharter.org/');
    button.setAttribute('data-layout', 'button');

    return button;
  }

  createShariffList () {
    const unorderedList = document.createElement('ul');

    this._services.forEach( (service) => {
      let listItem = document.createElement('li');
      let link = document.createElement('a');
      listItem.className = service.name + ' ' + service.faName;
      link.href = service.shareUrl;
      link.innerHTML = service.title[this._language] ?
        service.title[this._language] : '';

      listItem.appendChild(link);
      unorderedList.appendChild(listItem);
    });

    console.log(unorderedList);

    this._rootElement.appendChild(unorderedList);
  }

  loadScript (url) {
    return new Promise(
      (resolve, reject) => {
        const loadingTimeout = root.setTimeout(() => {
          reject('Timeout!');
        }, 10000);

        const head = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = (event) => {
          root.clearTimeout(loadingTimeout);
          resolve(event);
        };
        head.appendChild(script);
      }
    );
  }

  _createServices (availableServices) {
    const allServices = availableServices.map( (availableService) => {
      availableService = availableService(this);
      if (this.options.services.indexOf(availableService.name) > -1) {
        return availableService;
      }
    });

    const filteredServices = allServices.filter( (service) => {
      return service != null;
    });

    return filteredServices;
  }

  getOption (name) {
    const option = this.options[name];
    return (typeof option === 'function') ? option.call(this) : option;
  }

  getURL () {
    return location.href;
  }

  getReferrerTrack () {
    return this.options.referrerTrack || '';
  }

  getTitle () {
    return this.getOption('title');
  }

  getMeta (name) {
    const firstMatchingElement = document.querySelector(
      'meta[name="' + name + '"],[property="' + name + '"]'
    );

    const metaContent = firstMatchingElement ?
      firstMatchingElement.getAttribute('content') : '';

    return metaContent;
  }

  getDefaults () {
    return {
      services: [
        'facebook',
        'twitter'
      ],
      referrerTrack: null,
      useShariff: true
    };
  }
}

export default SocialShare;
