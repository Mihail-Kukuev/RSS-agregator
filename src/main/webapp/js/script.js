var feeds = [];
mainUrl = "rss/";

/*feeds.push(new Feed("https://habrahabr.ru/rss/hub/java/", "Хабрахабр / JAVA / Интересные публикации"));
feeds.push(new Feed("https://dev.by/rss", "dev.by: Все о работе в IT"));
feeds.push(new Feed("http://news.tut.by/rss/afisha.rss", "TUT.BY: Новости ТУТ - Афиша"));
feeds.push(new Feed("http://lifehacker.ru/feed/", "Лайфхакер"));
localStorage.clear();
localStorage.setItem("feeds", JSON.stringify(feeds));
feeds.length = 0;*/

window.onload = function() {
	document.forms.addFeedForm.addEventListener('keypress', function(e) {
		if (e.keyCode == 13) addFeed();
	});

	//take values from localStorage
	feeds = JSON.parse(localStorage.getItem("feeds"));
	if (feeds==null) feeds = [];
	else for (var i=0; i<feeds.length; i++){
		feeds[i].deleteItemDate = function (date) {
			this.unreadItems.splice(this.unreadItems.indexOf(date), 1);
		};

		feeds[i].addItemDate = function (date) {
			if (this.unreadItems.indexOf(date)==-1)
				this.unreadItems.push(date);
			//todo: вставить в нужное место
		};
	}

	//create list of feeds
	var feedListDiv = document.getElementById("list-feeds");
	feeds.forEach(function(feed, i, arr) {
		feedListDiv.insertAdjacentHTML('beforeEnd', createFeedItemHTML(feed.feedTitle, feed.unreadItems.length));
	});
	if (feedListDiv.childElementCount!=0){
		clickOnFeed(feedListDiv.firstElementChild);
	}
};
window.onunload = function() {
	localStorage.clear();
	localStorage.setItem("feeds",JSON.stringify(feeds));
};

function checkAsRead (elem){
	item = elem.parentNode;
	var activeFeedName = getActiveFeedName();
	if (item.className=="item"){
		item.className = "item item-checked";
		item.lastElementChild.className = "fa fa-check-square fa-2x";

		var index = indexOfFeed(activeFeedName);
		if (index!=-1) {
			feeds[index].deleteItemDate(item.id);
		}
	}
	else {
		item.className = "item";
		item.lastElementChild.className = "fa fa-square-o fa-2x";
		feeds[indexOfFeed(getActiveFeedName())].addItemDate(item.id);
	}
	updateCountOfUnread(activeFeedName);
}

function createItem(url, title, date, description, imgUrl) {
	var item = document.createElement("article");
	item.className = "item";
	item.id = date;

	var beginHTML = (imgUrl=="empty") ? "" : '<a href="'+url+'"><img src="' + imgUrl + '"></a>';
	var textAttribute = (imgUrl=="empty") ? '' : 'style="width: 320px;"';
	item.innerHTML = beginHTML + '<div class="article-text"' + textAttribute + '><a href="'+url+'"><h3>' + title
		+ '</h3></a><span>' + new Date(date).toLocaleString() + '</span><br>' + description + '</div><span class="new-flag">NEW</span>'
		+ '<i class="fa fa-square-o fa-2x" onclick="checkAsRead(this)"></i>';
	return item;

	//todo: create read or unread?
}

function loadItems(response) {
	var itemListDiv = document.getElementById("list-items");
	itemListDiv.innerHTML="";
	itemListDiv.insertAdjacentHTML('afterBegin', '<span class="read-more"><a href="">Read more</a></span>');
	var lastChild = itemListDiv.lastElementChild;
	var feed = JSON.parse(response);

	var feedIndex = indexOfFeed(feed.title);

	//todo: don't delete unread
	feeds[feedIndex].unreadItems.length = 0;
	feed.items.forEach(function(item, i, arr){
		itemListDiv.insertBefore(createItem(item.url, item.title, item.date, item.description, item.imgUrl), lastChild);

		//all feeds are unread
		feeds[feedIndex].unreadItems.push(item.date);
		//todo: add to array only new unread items
	});
	updateCountOfUnread(feed.title);
}

//-------------------------FEEDS---------------------------------/
function Feed (url, title, arr) {
	this.feedUrl = url;
	this.feedTitle = title;
	if (arr==null)
		this.unreadItems = [];
	else
		this.unreadItems = arr;
}
function indexOfFeed(feedName) {
	for(var i= 0; i<feeds.length; i++){
		if (feeds[i].feedTitle==feedName){
			return i;
		}
	}
	return -1;
}

function getActiveFeedName() {
	var activeElements = document.body.getElementsByClassName("list-group-item active");
	if (activeElements.length!=0) return activeElements[0].firstChild.nextSibling.textContent;
	else return null;
}
function updateCountOfUnread(feedName) {
	var feedNodes = document.getElementById("list-feeds").children;
	/*var feedNodes = listNodes.filter(function(node){
		if (node.nodeType==1 && node.className.indexOf("list-group-item")!=-1)
			return true;
		else return false;
	});*/

	for (var i=0; i<feedNodes.length; i++) {
		if (feedNodes[i].firstChild.nextSibling.textContent==feedName) {
			var count = feeds[indexOfFeed(feedName)].unreadItems.length;
			feedNodes[i].lastElementChild.innerHTML = (count==0) ? '' : count;
		}
	}
}

function addFeed() {
	var form = document.forms.addFeedForm;
	var inputValue = form.text.value.trim();

	feeds.forEach(function(feed, i, arr){
		if (feed.feedUrl==inputValue){
			alert("Such feed already exists!");
			form.text.value = '';
		}
	});
	if (form.text.value.length==0)
		return;

	ajax('GET', mainUrl+'validate_feed/?validateUrl='+form.text.value.trim(), null, function(response) {
		if (response=='invalid')
			alert('Wrong input! It isn\'t a rss-line');
		else {
			var newFeed = new Feed(inputValue, response);
			feeds.push(newFeed);

			document.getElementById("list-feeds").insertAdjacentHTML('beforeEnd',
				createFeedItemHTML(newFeed.feedTitle, newFeed.unreadItems.length));
			form.text.value = '';

			//solve: add all items as unread
			clickOnFeed(document.getElementById("list-feeds").lastElementChild);
		}
	});
}

function createFeedItemHTML(feedName, itemsCount) {
	if (itemsCount==0) itemsCount = '';
	return '<li class="list-group-item" onclick="clickOnFeed(this)"><i class="fa fa-bars fa-large"></i>' + feedName +
		'<i class="fa fa-times-circle fa-large" onclick="deleteFeed(this)"></i><span class="badge">'+ itemsCount + '</span></li>';
}

function clickOnFeed (elem){
	feedItemName = elem.className;
	if (feedItemName=="list-group-item active")
		return;

	var feedName = elem.firstChild.nextSibling.textContent;
	if (indexOfFeed(feedName)==-1)
		return;

	var activeElements = document.body.getElementsByClassName("list-group-item active");
	if (activeElements.length!=0) activeElements[0].className = "list-group-item";
	elem.className = "list-group-item active";

	url = mainUrl + 'get_feed/?feedUrl=' + feeds[indexOfFeed(feedName)].feedUrl;
	ajax('GET', url, null, loadItems);

	//todo: update unread feeds
}

function markFeedAsRead(){
	var activeFeedName = getActiveFeedName();
	if (activeFeedName!=null){
		feeds[indexOfFeed(activeFeedName)].unreadItems = [];
	}
	var activeElements = document.body.getElementsByClassName("list-group-item active");

	updateCountOfUnread(activeFeedName);

	var elements = document.body.getElementsByClassName("item");
	for (var i = 0; i < elements.length; i++) {
		elements[i].className = "item item-checked";
		elements[i].lastElementChild.className = "fa fa-check-square fa-2x";
	}
}

function deleteFeed(elem){
	feeds.splice(indexOfFeed(elem.previousSibling.textContent),1);
	elem.parentNode.remove();
	if (getActiveFeedName()==null){
		var feedListDiv = document.getElementById("list-feeds");
		if (feedListDiv.childElementCount!=0){
			clickOnFeed(feedListDiv.firstElementChild);
		}
	}
}

function turnOrganizeFeeds (elem){
	var iconName = elem.firstElementChild.className;
	if (iconName=="fa fa-cog fa-2x"){
		elem.firstElementChild.className = "fa fa-cog fa-2x fa-spin";
		document.body.getElementsByClassName("list-group")[0].className = "list-group list-edit";
	}
	else {
		elem.firstElementChild.className = "fa fa-cog fa-2x";
		document.body.getElementsByClassName("list-group list-edit")[0].className = "list-group";
	}
}

function ajax(method, url, data, continueWith) {
	var xhr = new XMLHttpRequest();

	xhr.open(method, url, true);

	xhr.onload = function () {
		if (xhr.readyState !== 4)
			return;
		if (xhr.status != 200) {
			console.error('Error on the server side, status ' + xhr.status);
			console.error('Error on the server side, response ' + xhr.responseText);
			return;
		}
		if (continueWith != null) continueWith(xhr.responseText);
	};

	xhr.ontimeout = function () {
		console.error('Server timed out!');
	};

	xhr.onerror = function () {
		console.error('Server connection error!\n\nCheck if server is active\n');
	};
	xhr.send(data);
}