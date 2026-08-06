(function () {
  var polling = false;

  function runCommand(command) {
    window.Asc.plugin.executeMethod("SearchNext", [{
      searchString: command.quote,
      matchCase: false
    }, true], function (found) {
      if (!found || command.action !== "comment") {
        window.Asc.plugin.executeMethod("FocusEditor", []);
        return;
      }
      window.Asc.plugin.executeMethod("AddComment", [{
        UserName: "Lab-BridGE AI",
        UserId: "labbridge-ai",
        QuoteText: command.quote,
        Text: command.feedback,
        Time: String(Date.now()),
        Solved: false,
        Replies: []
      }]);
    });
  }

  async function poll() {
    if (polling) return;
    polling = true;
    try {
      var response = await fetch("http://localhost:3000/api/editor-command", { cache: "no-store" });
      if (response.status === 200) runCommand(await response.json());
    } catch (_) {
      // The editor page can be temporarily unavailable during navigation.
    } finally {
      polling = false;
    }
  }

  window.Asc.plugin.init = function () {
    window.setInterval(poll, 700);
    poll();
  };
})();
