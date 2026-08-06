(function () {
  var polling = false;
  var settings = window.LABBRIDGE_PLUGIN || {};

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
      if (!settings.apiBase || !settings.documentId) return;
      var response = await fetch(settings.apiBase + "/api/editor-command?documentId=" + encodeURIComponent(settings.documentId), { cache: "no-store" });
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
