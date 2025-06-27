import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationRoute extends Route {
  @service launchdarkly;

  beforeModel() {
    return this.launchdarkly.initialize();
  }

  @action
  sendError() {
    try {
      throw new Error('This is an intentional error for testing LaunchDarkly.');
    } catch (e) {
      this.launchdarkly.error(e, 'User triggered a test error.');
    }
  }
} 