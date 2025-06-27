import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { initialize } from 'launchdarkly-js-client-sdk';
import Observability, { LDObserve } from "@launchdarkly/observability";
import SessionReplay from "@launchdarkly/session-replay";
import config from 'super-rentals/config/environment';

export default class LaunchDarklyService extends Service {
  @tracked flags = {};

  @tracked
  _isReady = false;

  get isReady() {
    return this._isReady;
  }

  initialize() {
    const context = {
      kind: 'user',
      key: 'context-key-123abcde',
    };

    this.client = initialize(config.APP.launchDarklyClientSideId, context, {
      plugins: [ new Observability({
        tracingOrigins: true,
        networkRecording: {
          enabled: true,
          recordHeadersAndBody: true
        }
      }), new SessionReplay({
        privacySetting: 'none',
      }) ]
    });

    this.client.on('ready', () => {
      this.flags = this.client.allFlags();
      this._isReady = true;
    });

    this.client.on('change', (changes) => {
      const newFlags = { ...this.flags };
      for (const key in changes) {
        newFlags[key] = changes[key].current;
      }
      this.flags = newFlags;
    });

    return this.client.waitForInitialization();
  }

  variation(flagKey, defaultValue = false) {
    if (!this.isReady) {
      return defaultValue;
    }
    return this.flags[flagKey] ?? defaultValue;
  }

  variationDetail(flagKey, defaultValue = false) {
    if (!this.client) {
      return {
        value: defaultValue,
        variationIndex: null,
        reason: { kind: 'ERROR', errorKind: 'CLIENT_NOT_READY' },
      };
    }

    // By accessing the flags property, we ensure that any component
    // using variationDetail will re-render when a flag changes.
    this.flags;

    return this.client.variationDetail(flagKey, defaultValue);
  }

  error(error, message) {
    LDObserve.recordError(error, message);
  }
} 