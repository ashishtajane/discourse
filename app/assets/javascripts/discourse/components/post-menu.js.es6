const PostMenuComponent = Ember.Component.extend();

PostMenuComponent.reopenClass({
  registerButton(callback){
    this._registerButtonCallbacks = this._registerButtonCallbacks || [];
    this._registerButtonCallbacks.push(callback);
  }
});

export default PostMenuComponent;
