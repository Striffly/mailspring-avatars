import { ComponentRegistry } from 'mailspring-exports';
import AvatarFactory from './avatar-factory';
import { stopCleanup } from './avatar-image';

const SmallAvatar = AvatarFactory(32,'SmallAvatar');
const LargeAvatar = AvatarFactory(42,'LargeAvatar');

// Activate is called when the package is loaded. If your package previously
// saved state using `serialize` it is provided.
//
export function activate() {
  ComponentRegistry.register( SmallAvatar, {role: 'ThreadListIcon'});
  // See `thread-list-columns.cjsx#L132` -> In Narrow mode, Icons are limited to 1 because of UI issue. Hack around and use MailLabel for larger size
  ComponentRegistry.register( LargeAvatar, {role: 'Thread:MailLabel'});
}

// Serialize is called when your package is about to be unmounted.
// You can return a state object that will be passed back to your package
// when it is re-activated.
//
export function serialize() {
}

// This **optional** method is called when the window is shutting down,
// or when your package is being updated or disabled. If your package is
// watching any files, holding external resources, providing commands or
// subscribing to events, release them here.
//
export function deactivate() {
  ComponentRegistry.unregister(SmallAvatar);
  // ComponentRegistry.unregister(LargeAvatar);
  stopCleanup();
}
