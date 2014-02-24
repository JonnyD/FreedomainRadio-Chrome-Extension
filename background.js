console.log("hello");
         
jQuery.support.cors = true;         
var feedItems = [];
var podcastUrl = "http://pipes.yahoo.com/pipes/pipe.run?_id=e5f849875fd5f61b23e5d7f79873d9c9&_render=json";
var videoUrl = "http://gdata.youtube.com/feeds/api/users/stefbot/uploads?v=2&alt=jsonc";

function initialise() {
    if (!localStorage.updateInterval) {
        localStorage.updateInterval = 5;
    }
    
    if (!localStorage.types) {
        localStorage.types = "podcast:true;video:true;topic:true";
    }
    
    chrome.browserAction.setBadgeBackgroundColor({color:[255, 102, 0, 255]});
    
    fetchFeeds();
}

function fetchPodcasts(callback) {
    $.ajax({
        url: podcastUrl,
        type: "GET",
        timeout: 30000,
        dataType: "json",
        success: function(data) {
            console.log(data);
            parsePodcasts(data.value, callback);
        },
        error: function(jqXHR, textStatus, ex) {
            console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        }
    });    
}

function parsePodcasts(data, callback) {
    var podcasts = data.items;
    
    var newPodcastItems = [];
    for (var i = 0; i < podcasts.length; i++) {
        var podcast = podcasts[i];
        
        var item = {
            date: convertToUnix(podcast.pubDate), 
            title: podcast.title,
            description: podcast.description,
            thumbnail: '/img/podcast.jpg',
            link: podcast.link
        };      

        newPodcastItems.push(item);
    }
    
    callback(newPodcastItems);
}

function fetchVideos(callback) {
    var xhrFeed = new XMLHttpRequest();
    xhrFeed.onreadystatechange = function() {
        if (xhrFeed.readyState == 4 && xhrFeed.status == 200) {
            parseVideos(xhrFeed.responseText, callback);
        }   
    }
    xhrFeed.open("GET", videoUrl, true);
    xhrFeed.send();                
}

function parseVideos(data, callback) {
    var youtubeJSON = JSON.parse(data);
    var youtubeVideos = youtubeJSON.data.items;
    
    var newVideoItems = [];
    for (var i = 0; i < youtubeVideos.length; i++) {
        var video = youtubeVideos[i];
        
        var item = { 
            date: convertToUnix(video.uploaded), 
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail.hqDefault,
            link: "http://www.youtube.com/watch?v=" + video.id 
        };
        
        newVideoItems.push(item);
    }
    
    callback(newVideoItems);
}

function fetchFeeds() {
    fetchVideos(function(newVideoItems) {
        fetchPodcasts(function(newPodcastItems) {
            var newFeedItems = newVideoItems.concat(newPodcastItems);
            processLatestFeed(newFeedItems, function() {
              updateBadge();
            });
        });
    });
    
}

function processLatestFeed(newFeedItems, callback) {
    newFeedItems.sort(function(a,b) {return (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0);});
    
    for (var i = 0; i < 25; i++) {
        var newItem = newFeedItems[i];
        
        if (!isItemInFeed(newItem)) {
            newItem.featured = true;
            newItem.description = newItem.description.substring(0,320);
            feedItems.push(newItem);
        }
    }
    
    callback();
}

function isItemInFeed(item) {
    for (i in feedItems) {
        if (feedItems[i]["link"] == item.link) {
            return true;
        }
    }
    return false;
}

function convertToUnix(date) {
  return moment(date).unix()
}

function getFeaturedCount() {
    var featured = 0;
    
    for (i in feedItems) {
        var feedItem = feedItems[i];
        if (feedItem.featured == true) {
            featured++;
        }
    }
    
    return featured;
}

function updateBadge() {
  var featured = getFeaturedCount();
  
  if (featured > 0) {
      chrome.browserAction.setBadgeText({text: featured + ""});
      chrome.browserAction.setTitle({title: featured + " new item" + ((featured > 1) ? "s": "")});
  } else {
      chrome.browserAction.setBadgeText({text: ""});
      chrome.browserAction.setTitle({title: "No new items"});
  }
  
  console.log("badge updated");
}

initialise();