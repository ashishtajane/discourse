import ScreenTrack from 'discourse/lib/screen-track';
const PostView = Ember.View.extend(Ember.Evented, {
  templateName: function() {
    return (this.get('post.post_type') === this.site.get('post_types.small_action')) ? 'post-small-action' : 'post';
  }.property('post.post_type'),

  needsModeratorClass: function() {
    return (this.get('post.post_type') === this.site.get('post_types.moderator_action')) ||
           (this.get('post.topic.is_warning') && this.get('post.firstPost'));
  }.property('post.post_type'),

  _destroyedPostView: function() {
    ScreenTrack.current().stopTracking(this.get('elementId'));
  }.on('willDestroyElement'),

  _postViewInserted: function() {
    const $post = this.$(),
          postNumber = this.get('post').get('post_number');

    ScreenTrack.current().track($post.prop('id'), postNumber);

    this.trigger('postViewInserted', $post);

    this._applySearchHighlight();
  }.on('didInsertElement'),

  _fixImageSizes: function(){
    var maxWidth;
    this.$('img:not(.avatar)').each(function(idx,img){

      // deferring work only for posts with images
      // we got to use screen here, cause nothing is rendered yet.
      // long term we may want to allow for weird margins that are enforced, instead of hardcoding at 70/20
      maxWidth = maxWidth || $(window).width() - (Discourse.Mobile.mobileView ? 20 : 70);
      if (Discourse.SiteSettings.max_image_width < maxWidth) {
        maxWidth = Discourse.SiteSettings.max_image_width;
      }

      var aspect = img.height / img.width;
      if (img.width > maxWidth) {
        img.width = maxWidth;
        img.height = parseInt(maxWidth * aspect,10);
      }

      // very unlikely but lets fix this too
      if (img.height > Discourse.SiteSettings.max_image_height) {
        img.height = Discourse.SiteSettings.max_image_height;
        img.width = parseInt(maxWidth / aspect,10);
      }

    });
  }.on('willInsertElement'),

  _applySearchHighlight: function() {
    const highlight = this.get('searchService.highlightTerm');
    const cooked = this.$('.cooked');

    if (!cooked) { return; }

    if (highlight && highlight.length > 2) {
      if (this._highlighted) {
         cooked.unhighlight();
      }
      cooked.highlight(highlight.split(/\s+/));
      this._highlighted = true;

    } else if (this._highlighted) {
      cooked.unhighlight();
      this._highlighted = false;
    }
  }.observes('searchService.highlightTerm', 'cooked')
});

export default PostView;
