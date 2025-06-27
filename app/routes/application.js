import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service launchdarkly;

  async beforeModel() {
    await this.launchdarkly.initialize();
  }
} 