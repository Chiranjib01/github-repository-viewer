const viewBtn = document.getElementById("view");
const main = document.querySelector(".main");

var perPage = 10;
var page = 1;
var user = null;
var total = 10;
var search_text = "";
var userData = null;
var repoData = null;

viewBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value;
  user = username;
  if (user) {
    showLoader();
    fetchData();
  }
});

const fetchData = async () => {
  // urls
  const baseUrl = `https://api.github.com`;
  const userUrl = `${baseUrl}/users/${user}`;
  const repoUrl = `${userUrl}/repos?per_page=${perPage}&page=${page}`;

  // fetching user data
  const userResp = await fetch(userUrl);
  if (userResp.status === 404) {
    window.location.reload();
    return;
  }
  userData = await userResp.json();

  // fetching repo data
  const repoResp = await fetch(repoUrl);
  repoData = await repoResp.json();

  // bind data
  bindData(userData, repoData);
};

const bindData = (userDataArr, repoDataArr) => {
  // setting user data
  const userDetailsTemplate = document.getElementById("template-user-details");
  main.innerHTML = "";
  const userNode = userDetailsTemplate.content.cloneNode(true);
  fillUserData(userNode, userDataArr);
  main.appendChild(userNode);

  // showing filter and search
  const actions = document.querySelector(".actions");
  const actionsTemplate = document.getElementById("template-actions");
  actions.innerHTML = "";
  const actionsNode = actionsTemplate.content.cloneNode(true);
  actionsNode.getElementById("per-page").value = perPage;
  actionsNode.getElementById("search").value = search_text;
  actions.appendChild(actionsNode);

  // back button
  const backBtn = document.getElementById("back-btn");
  backBtn.addEventListener("click", () => {
    window.location.reload();
  });

  // handle filters
  const filterBtn = document.getElementById("filterBtn");
  filterBtn.addEventListener("click", () => {
    const repoPerPage = document.getElementById("per-page").value;
    if (1 <= repoPerPage && repoPerPage <= 100) {
      perPage = repoPerPage;
      showLoader();
      document.getElementById("per-page").value = perPage;
      fetchData();
    }
  });

  // handle search
  const searchBtn = document.getElementById("searchBtn");
  searchBtn.addEventListener("click", () => {
    const text = document.getElementById("search").value;
    search_text = text;
    showLoader();
    document.getElementById("search").value = search_text;
    handleSearch();
  });

  // setting repo data
  const repoCardTemplate = document.getElementById("template-repo-card");
  const noRepoTemplate = document.getElementById("template-no-repo");
  const reposSection = document.querySelector(".repos");

  reposSection.innerHTML = "";

  if (repoDataArr.length == 0) {
    const noRepoNode = noRepoTemplate.content.cloneNode(true);
    reposSection.appendChild(noRepoNode);
  } else {
    repoDataArr.forEach((repo) => {
      const repoNode = repoCardTemplate.content.cloneNode(true);
      fillRepoData(repoNode, repo);
      reposSection.appendChild(repoNode);
    });

    // pagination
    let total_page = Math.ceil(total / perPage);
    element(total_page, page);
  }
};

const fillRepoData = (repoNode, repo) => {
  let repoName = repo.name;
  let repoDescription = repo.description || "No Description";
  let repoTopics = repo.topics || [];
  let repoHtmlUrl = repo.html_url;
  let topics = "";
  repoTopics.forEach((topic) => (topics += `<div>${topic}</div>`));

  const repoNameContainer = repoNode.getElementById("repo-name");
  const repoDescContainer = repoNode.getElementById("repo-description");
  const repoTopicsContainer = repoNode.getElementById("topics");
  repoNameContainer.innerHTML = repoName;
  repoDescContainer.innerHTML = repoDescription;
  repoTopicsContainer.innerHTML = topics;

  //   redirecting to the repo
  repoNode.firstElementChild.addEventListener("click", () => {
    window.open(repoHtmlUrl, "_blank");
  });
};

const fillUserData = (userNode, userDataArr) => {
  let userAvatar = userDataArr.avatar_url;
  let userFullName = userDataArr.name ? userDataArr.name : user;
  let userBio = userDataArr.bio;
  let userLocation = userDataArr.location;
  let userTwitterUrl = userDataArr.twitter_username
    ? `https://twitter.com/${userDataArr.twitter_username}`
    : "Not provided";
  let userHtmlUrl = userDataArr.html_url;
  let totalPublicRepos = userDataArr.public_repos;

  total = totalPublicRepos;

  const profileImg = userNode.getElementById("avatar");
  const uname = userNode.getElementById("uname");
  const bio = userNode.getElementById("user-bio");
  const location = userNode.getElementById("user-location");
  const twitter = userNode.getElementById("user-twitter-url");
  const htmlUrl = userNode.getElementById("user-html-url");
  const totalRepos = userNode.getElementById("total-repos");

  profileImg.src = userAvatar;
  uname.innerHTML = userFullName;
  bio.innerHTML = userBio;
  location.innerHTML = userLocation
    ? `<i class="fa-solid fa-location-dot"></i> ${userLocation}`
    : "";
  twitter.innerHTML = userTwitterUrl;
  htmlUrl.innerHTML = userHtmlUrl;
  totalRepos.innerHTML = totalPublicRepos;
};

const handleSearch = () => {
  let repoDataArr = repoData.filter((repo) => {
    // search fields
    let s1 = repo.name.toLowerCase().includes(search_text.toLowerCase());
    let s2 = repo.description
      ?.toLowerCase()
      .includes(search_text.toLowerCase());
    let s3 = repo.topics?.includes(search_text.toLowerCase());

    return s1 || s2 || s3;
  });

  // bind data
  bindData(userData, repoDataArr);
};

const showLoader = () => {
  let loader = "./assets/loader.gif";
  main.innerHTML = `
      <div class="loader-screen"></div>
      <div class="loader">
        <img src=${loader} height={60} width={60} alt="loading..." />
      </div>
    `;
};

// pagination
const ulTag = document.getElementById("pagination-ul");

const element = (totalPages, pageNum) => {
  let liTag = ``;
  let activeLi;
  let beforePages = pageNum - 1;
  let afterPages = pageNum + 1;
  if (pageNum > 1) {
    liTag += `<li class="btn prev" onclick="paginationHandler(${totalPages},${
      pageNum - 1
    })"><span><i class="fas fa-angle-left"></i> Prev</span></li>`;
  }
  if (pageNum > 2) {
    liTag += `<li class="numb" onclick="paginationHandler(${totalPages},1)"><span>1</span></li>`;
    if (pageNum > 3) {
      liTag += `<li class="dots"><span>...</span></li>`;
    }
  }

  if (pageNum == totalPages) {
    beforePages = beforePages - 2;
  } else if (pageNum == totalPages - 1) {
    beforePages = beforePages - 1;
  }

  if (pageNum == 1) {
    afterPages = afterPages + 2;
  } else if (pageNum == 2) {
    afterPages = afterPages + 1;
  }

  if (beforePages < 1) beforePages = 0;

  for (let pageLength = beforePages; pageLength <= afterPages; pageLength++) {
    if (pageLength > totalPages) {
      continue;
    }
    if (pageLength == 0) {
      pageLength = pageLength + 1;
    }
    if (pageLength == pageNum) {
      activeLi = "active";
    } else {
      activeLi = "";
    }
    liTag += `<li class="numb ${activeLi} a" onclick="paginationHandler(${totalPages},${pageLength})"><span>${pageLength}</span></li>`;
  }
  if (pageNum < totalPages - 1) {
    if (pageNum < totalPages - 2) {
      liTag += `<li class="dots"><span>...</span></li>`;
    }
    liTag += `<li class="numb b" onclick="paginationHandler(${totalPages},${totalPages})"><span>${totalPages}</span></li>`;
  }
  if (pageNum < totalPages) {
    liTag += `<li class="btn next c" onclick="paginationHandler(${totalPages},${
      pageNum + 1
    })"><span>Next <i class="fas fa-angle-right"></i></span></li>`;
  }
  ulTag.innerHTML = liTag;
};

const paginationHandler = (tp, pl) => {
  element(tp, pl);
  page = pl;
  showLoader();
  fetchData();
};
