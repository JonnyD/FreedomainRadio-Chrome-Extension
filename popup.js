document.addEventListener('DOMContentLoaded', function () {
    initialise();
});

function initialise() {
    var background = chrome.extension.getBackgroundPage();
    var latestItems = background.feedItems;
    
    createLatestFeed(latestItems);
    
    background.updateBadge();
}

function createLatestFeed(latestItems) {
    var content = document.getElementById("content");
    var itemView = document.createElement("div");
    itemView.setAttribute("class", "item");
    content.appendChild(itemView);
    
    for (var i = 0; i < 25; i++) {
        var item = latestItems[i];
        var detail = document.createElement("div");
        detail.setAttribute("class", "detail");
        
        if (item["featured"]) {
            detail.setAttribute("class", "featured");
            item["featured"] = false;
        }
        
        var thumbnailLink = document.createElement("a");
        
         if(item["type"] == "podcast"){
            thumbnailLink.setAttribute("href", "#");
            thumbnailLink.setAttribute("onClick", "javascript:window.open('http://fdrpodcast.com/player.php?id=" + item["linkId"] + "','podcastplayer','toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, width=375, height=125');");
        } else {
            thumbnailLink.setAttribute("href", item["link"]); // set link path
            thumbnailLink.setAttribute("target", "_blank");
        }
        
        var thumbnailImg = document.createElement("img");
        thumbnailImg.setAttribute("class", "thumbnail");
        thumbnailImg.setAttribute("onclick", "openTab('" + item["link"] + "');");
        thumbnailImg.setAttribute( "src", item["thumbnail"] );
        thumbnailLink.appendChild(thumbnailImg);
        detail.appendChild(thumbnailLink);
        
        var link = document.createElement("a");
        
        if(item["type"] == "podcast"){
            link.setAttribute("href", "#");
            link.setAttribute("onClick", "javascript:window.open('http://fdrpodcast.com/player.php?id=" + item["linkId"] + "','podcastplayer','toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, width=375, height=125');");
        } else {
            link.setAttribute("href", item["link"]);
            link.setAttribute("target", "_blank");
        }

        var titleNode = document.createElement("div");
        titleNode.setAttribute("class", "title");
        titleNode.appendChild(document.createTextNode(item["title"]));
        link.appendChild(titleNode);
        detail.appendChild(link);
        
        var descriptionNode = document.createElement("div");
        descriptionNode.setAttribute("class", "description");  
       descriptionNode.appendChild(document.createTextNode(item["description"]));
        detail.appendChild(descriptionNode);
        
        itemView.appendChild(detail);
    }
    
}
