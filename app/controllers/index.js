import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class IndexController extends Controller {
  @service launchdarkly;

  get isLaunchDarklyReady() {
    return this.launchdarkly.isReady;
  }

  get emberFlag() {
    const detail = this.launchdarkly.variationDetail('ember-flag', false);

    console.log('emberFlag details:', {
      value: detail.value,
      variationIndex: detail.variationIndex,
      reason: detail.reason,
    });

    return detail.value;
  }
} 