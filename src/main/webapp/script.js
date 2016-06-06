var feeds = [];
mainUrl = "rss/";
var engLocale = {
	language : "eng",
	appName : "RSS-aggreagator",
	inputPlaceholder : "New feed url",
	organizeFeeds : "Organize your feeds",
	markFeed : "Mark feed as read",
	msgExistsFeed : "Such feed already exists.",
	msgWronginput : "Wrong input! It isn\'t an RSS-feed"
};
var ruLocale = {
	language : "ru",
	appName : "RSS-агрегатор",
	inputPlaceholder : "Адрес новой ленты",
	organizeFeeds : "Редактировать список лент",
	markFeed : "Отметить ленту как прочитанную",
	msgExistsFeed : "Такая лента уже есть в списке",
	msgWronginput : "Введенный адрес не является RSS-ресурсом"
};
var locale = {};
locale.language = engLocale;

function changeLocale(language) {
	if (locale.language==language) return;
	locale = (language=='ru') ? ruLocale : engLocale;
	for (var key in locale) {
		if (key=="inputPlaceholder")
			document.getElementById(key).setAttribute("placeholder", locale[key])
		else if (key=="appName" || key=="inputPlaceholder" || key=="organizeFeeds" || key=="markFeed")
			document.getElementById(key).textContent = locale[key];
	}
}

window.onload = function() {
	document.forms.addFeedForm.addEventListener('keypress', function(e) {
		if (e.keyCode == 13) addFeed();
	});

	//take values from localStorage
	feeds = JSON.parse(localStorage.getItem("feeds"));
	if (feeds==null) feeds = [];
	else for (var i=0; i<feeds.length; i++){
		feeds[i].deleteItemDate = function (date) {
			if (this.unreadItems.indexOf(date) != -1)
				this.unreadItems.splice(this.unreadItems.indexOf(date), 1);
		};

		feeds[i].addItemDate = function (date) {
			if (this.unreadItems.indexOf(date)==-1)
				this.unreadItems.push(date);
		};
	}

	//create list of feeds
	var feedListDiv = document.getElementById("list-feeds");
	feeds.forEach(function(feed, i, arr) {
		feedListDiv.insertAdjacentHTML('beforeEnd', createFeedItemHTML(feed.feedTitle, feed.unreadItems.length, feed.link));
	});
	if (feedListDiv.childElementCount!=0){
		clickOnFeed(feedListDiv.firstElementChild);
	}
};
window.onunload = function() {
	localStorage.clear();
	localStorage.setItem("feeds",JSON.stringify(feeds));
};

function checkAsRead (elem, off){
	item = elem.parentNode;
	if (item.className.indexOf("item")==-1) item = item.parentNode;
	var activeFeedName = getActiveFeedName();
	if (item.className=="item"){
		item.className = "item item-checked";
		item.lastElementChild.className = "fa fa-check-square fa-2x";

		var index = indexOfFeed(activeFeedName);
		if (index!=-1) {
			feeds[index].deleteItemDate(item.id);
		}
	}
	else if (!off){
		item.className = "item";
		item.lastElementChild.className = "fa fa-square-o fa-2x";
		feeds[indexOfFeed(getActiveFeedName())].addItemDate(item.id);
	}
	updateCountOfUnread(activeFeedName);
}

function createItem(url, title, date, description, imgUrl, isRead) {
	var itemClassName = "item";
	var iconClassName = "fa fa-square-o fa-2x";
	if (isRead) {
		itemClassName = "item item-checked";
		iconClassName = "fa fa-check-square fa-2x";
	}

	var item = document.createElement("article");
	item.className = itemClassName;
	item.id = date;

	var beginHTML = (imgUrl=="empty") ? "" : '<a href="'+url+'" onclick="checkAsRead(this, true)"><img src="' + imgUrl + '"></a>';
	var textAttribute = (imgUrl=="empty") ? '' : 'style="width: 320px;"';
	item.innerHTML = beginHTML + '<div class="article-text"' + textAttribute + '><a href="'+url+'" onclick="checkAsRead(this, true)"><h3>'
		+ title + '</h3></a><span>' + new Date(date).toLocaleString() + '</span><br>' + description
		+ '</div><span class="new-flag">NEW</span>' + '<i class="' + iconClassName + '" onclick="checkAsRead(this)"></i>';
	return item;
}

function loadItems(response) {
	var feed = JSON.parse(response);
	var feedIndex = indexOfFeed(feed.title);

	var itemListDiv = document.getElementById("list-items");
	itemListDiv.innerHTML = "";
	itemListDiv.insertAdjacentHTML('afterBegin', '<span class="rss-link"><a href="'
		+ feeds[feedIndex].feedUrl + '"><i class="fa fa-rss "></i>' + feed.title + '</a></span>');
	var lastChild = itemListDiv.lastElementChild;

	var maxDate = 0;

	feed.items.forEach(function(item, i, arr){
		var isRead = false;
		if (item.date > feeds[feedIndex].lastDate){  //new item
			isRead = false;
			feeds[feedIndex].unreadItems.push(""+item.date);
		}
		else if (feeds[feedIndex].unreadItems.indexOf(""+item.date)==-1) {  //read item
			isRead = true;
		}

		// itemListDiv.insertBefore(createItem(item.url, item.title, item.date, item.description, item.imgUrl, isRead), lastChild);
		itemListDiv.insertAdjacentElement("beforeEnd",
			createItem(item.url, item.title, item.date, item.description, item.imgUrl, isRead));
		if (maxDate < item.date)
			maxDate = item.date;
	});
	feeds[feedIndex].lastDate = maxDate;

	updateCountOfUnread(feed.title);
}

//-------------------------FEEDS---------------------------------/
function Feed (url, title, link, arr) {
	this.feedUrl = url;
	this.feedTitle = title;
	this.lastDate = 1;
	this.link = link;
	if (arr==null)
		this.unreadItems = [];
	else
		this.unreadItems = arr;

	this.deleteItemDate = function (date) {
		if (this.unreadItems.indexOf(date) != -1)
			this.unreadItems.splice(this.unreadItems.indexOf(date), 1);
	};

	this.addItemDate = function (date) {
		if (this.unreadItems.indexOf(date)==-1)
			this.unreadItems.push(date);
	};
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
			alert(locale.msgExistsFeed);
			form.text.value = '';
		}
	});
	if (form.text.value.length==0)
		return;

	ajax('GET', mainUrl+'validate_feed/?validateUrl='+form.text.value.trim(), null, function(response) {
		var feed = JSON.parse(response);
		
		if (feed.title=='invalid')
			alert(locale.msgWronginput);
		else {
			var newFeed = new Feed(inputValue, feed.title, feed.link);
			feeds.push(newFeed);

			document.getElementById("list-feeds").insertAdjacentHTML('beforeEnd',
				createFeedItemHTML(newFeed.feedTitle, newFeed.unreadItems.length, newFeed.link));
			form.text.value = '';

			//solve: add all items as unread
			clickOnFeed(document.getElementById("list-feeds").lastElementChild);
		}
	});
}

function createFeedItemHTML(feedName, itemsCount, feedUrl) {
	if (itemsCount==0) itemsCount = '';
	return '<div class="list-group-item" onclick="clickOnFeed(this)">' +
		'<img src="http://www.google.com/s2/favicons?domain_url=' + feedUrl + '">' +
		feedName +
		'<i class="fa fa-times-circle fa-large" onclick="deleteFeed(this)"></i><span class="badge">'+ itemsCount + '</span></li>';
}

function clickOnFeed (elem){
	feedItemName = elem.className;
	/*if (feedItemName=="list-group-item active")
		return;*/

	var feedName = elem.firstChild.nextSibling.textContent;
	if (indexOfFeed(feedName)==-1)
		return;

	var activeElements = document.body.getElementsByClassName("list-group-item active");
	if (activeElements.length!=0) activeElements[0].className = "list-group-item";
	elem.className = "list-group-item active";

	url = mainUrl + 'get_feed/?feedUrl=' + feeds[indexOfFeed(feedName)].feedUrl;
	ajax('GET', url, null, loadItems);

	//todo: update ALL unread feeds
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