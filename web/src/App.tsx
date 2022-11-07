import "./App.css";

export const NOTION_HOME_URL =
  "https://xn--yu8h.notion.site/What-is-a-Virtual-HackerSpace-2f6b96d139e144ef8b3677c2852db910";

function App() {
  window.location.href = NOTION_HOME_URL;
  return (
    <div className="App">
      <header className="App-header">Virtual HackerSpace</header>
      <pre>Redirecting...</pre>
    </div>
  );
}

export default App;
