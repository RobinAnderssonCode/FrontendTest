var bool = true;

//Gets the git user info
function searchUser() {
    bool = true;
    document.getElementById("not-found").innerHTML = '';
    document.getElementById("user").innerHTML = '';
    document.getElementById("repos").innerHTML = '';

    var user = document.getElementById("searchbox").value;
    var http = new XMLHttpRequest();
    http.open("GET", "https://api.github.com/users/" + user);
    http.onload = function(e) {
        if (http.readyState === 4) {
            if (http.status === 200) {
                foundUser(http.responseText); // If user found. calls foundUser for parsing and building the user div.
            } else {
                console.error(http.statusText);
                notFound(); // Else builds not found message.
            }
        }
    };
    http.onerror = function(e) {
        console.error(http.statusText);
    };
    http.send();
}

// Parses the response to JSON and builds the user div.
function foundUser(usr) {
    var userInfo = JSON.parse(usr);

    if (userInfo.name === null) {
        userInfo.name = "Full name";
    }
    if (userInfo.bio === null) {
        userInfo.bio = "this is the bio...";
    }

    document.getElementById("user").innerHTML = '<img id="avatar" src="' + userInfo.avatar_url + '" alt="Avatar">' + '<div id="user-info"><p id="username">@' + userInfo.login + '</p>' + '<h1 id="name">' + userInfo.name + '</h1>' + '<p id="bio">' + userInfo.bio + '</div>';
    document.getElementById("repos").innerHTML = '<h3 id="rep-headline">Repositories</h3>' + '<hr id="thick">';

    getRepos(userInfo.repos_url); // Calls getRepos with the link from the parsed string.
}

// Gets the repos 
function getRepos(repoURL) {
    var http = new XMLHttpRequest();
    http.open("GET", repoURL);
    http.onload = function(e) {
        if (http.readyState === 4) {
            if (http.status === 200) {
                var headers = http.getAllResponseHeaders().toLowerCase(); // Gets the headers.  
                if (bool === true) { // To avoid infinite loop.
                    parseLinkHeader(headers); // Parses the links in the header. For users with many repos.
                    bool = false;
                }
                listRepos(http.responseText); // Builds the repos in the repos div.
            } else {
                console.error(http.statusText);
            }
        }
    };
    http.onerror = function(e) {
        console.error(http.statusText);
    };
    http.send();
}

// Splits the repo string and parses it to JSON
function listRepos(repos) {
    var res = repos.split(",");
    var repoList = document.getElementById("repos");
    res = JSON.parse(res);

    res.forEach(function(val) { // Builds the repos in the div.
        repoList.innerHTML += '<a target="_blank" href="' + val.html_url + '">' + ' <h3 class="repo-line repo-name">' + val.name + '</h3>' + '</a>' +
            '<p class="repo-line repo-info"><i class="fa fa-star sep-repo-info" aria-hidden="true">' + val.stargazers_count + '</i>' + '<i class="fa fa-code-fork sep-repo-info" aria-hidden="true">' + val.forks + '</i>' + '</p>' + '<hr>';
    });
}

function notFound() {
    document.getElementById("not-found").innerHTML = "<p>Does not exist</p>";
}

// Parses out the links in the header.
function parseLinkHeader(header) {

    var i, j, link, links, nextPage, lastPage, linkArr = [];

    i = header.search('<https://api.github.com/');
    links = header.substring(i).split(',');

    i = links[0].search('>') - 1;
    link = links[0].substring(1, i);
    j = link.search('page=') + 5;
    nextPage = parseInt(links[0].substring(j + 1, i + 1));

    i = links[1].search('>');
    lastPage = links[1].substring(2, i);
    lastPage = parseInt(links[1].substring(j + 2, i));

    i = nextPage - 2;
    for (nextPage; nextPage <= lastPage; nextPage++) {
        linkArr[i] = link + nextPage;
        i++;
    }

    if (linkArr.length > 0) {
        for (i = 0; i < linkArr.length; i++) { // Loops throud all the links. Independent of ?per_page
            getRepos(linkArr[i]); // Gets the repos with every link in the header to list all repos. 
        }
    }
}
