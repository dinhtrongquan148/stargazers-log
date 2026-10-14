const statusElement = document.querySelector("#status");
const repositoryList = document.querySelector("#repositories");

function formatDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    throw new Error(`Invalid starred_at date: ${dateString}`);
  }

  const [, yearString, monthString, dayString] = match;
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    throw new Error(`Invalid starred_at date: ${dateString}`);
  }

  const date = new Date(`${dateString}T00:00:00Z`);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function renderRepositories(repositories) {
  if (!Array.isArray(repositories)) {
    throw new Error("Repository data must be a JSON array.");
  }

  const fragment = document.createDocumentFragment();

  for (const repository of repositories) {
    if (
      typeof repository.repo !== "string" ||
      !/^[\w.-]+\/[\w.-]+$/.test(repository.repo) ||
      typeof repository.description !== "string" ||
      typeof repository.starred_at !== "string"
    ) {
      throw new Error("Repository data contains an invalid entry.");
    }

    const item = document.createElement("li");
    item.className = "repository-card";

    const heading = document.createElement("h3");
    heading.className = "repository-name";
    const link = document.createElement("a");
    link.href = `https://github.com/${repository.repo}`;
    link.textContent = repository.repo;
    heading.append(link);

    const description = document.createElement("p");
    description.className = "repository-description";
    description.textContent = repository.description;

    const date = document.createElement("p");
    date.className = "repository-date";
    date.textContent = `Starred ${formatDate(repository.starred_at)}`;

    item.append(heading, description, date);
    fragment.append(item);
  }

  repositoryList.replaceChildren(fragment);
  statusElement.textContent = repositories.length
    ? ""
    : "No starred repositories to show yet.";
}

async function loadRepositories() {
  try {
    const response = await fetch("./events.json");
    if (!response.ok) {
      throw new Error(`Could not load repositories (HTTP ${response.status}).`);
    }

    renderRepositories(await response.json());
  } catch (error) {
    statusElement.classList.add("status--error");
    statusElement.textContent = "Repositories could not be loaded. Please try again later.";
    console.error("Failed to load starred repositories:", error);
  }
}

loadRepositories();
