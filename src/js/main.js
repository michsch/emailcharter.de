const Turbolinks = require('turbolinks');
import SocialShare from './Modules/SocialShare/SocialShare';
import Style from '../_sass/main.scss';

Turbolinks.start();

const socialShare = new SocialShare({
  facebookButtonId: 'social-share-facebook',
  facebookAppId: '158613987550431'
});
window.socialShare = socialShare;
