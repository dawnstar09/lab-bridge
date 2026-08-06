(function () {
  var selectedText = "";
  var selectionElement;
  var reviewButton;
  var statusElement;
  var selectionRefreshTimer;

  function setStatus(message, isError) {
    statusElement.value = message;
    statusElement.className = isError ? "status error" : "status";
  }

  function forceReadableColors() {
    document.documentElement.style.setProperty("background", "#3f3f3f", "important");
    document.body.style.setProperty("background", "#3f3f3f", "important");
    document.body.style.setProperty("color", "#ffffff", "important");
    selectionElement.style.setProperty("background", "#ffffff", "important");
    selectionElement.style.setProperty("color", "#111111", "important");
    selectionElement.style.setProperty("-webkit-text-fill-color", "#111111", "important");
    var questionElement = document.getElementById("question");
    questionElement.style.setProperty("background", "#ffffff", "important");
    questionElement.style.setProperty("color", "#111111", "important");
    questionElement.style.setProperty("-webkit-text-fill-color", "#111111", "important");
    statusElement.style.setProperty("background", "transparent", "important");
    statusElement.style.setProperty("color", "#ffffff", "important");
    statusElement.style.setProperty("-webkit-text-fill-color", "#ffffff", "important");
  }

  function refreshSelection() {
    window.Asc.plugin.executeMethod("GetSelectedText", [{
      Numbering: false,
      Math: false,
      TableCellSeparator: "\n",
      ParaSeparator: "\n",
      TabSymbol: " "
    }], function (text) {
      selectedText = (text || "").trim();
      selectionElement.value = selectedText || "선택한 문장이 없습니다.";
      selectionElement.className = selectedText ? "selection" : "selection empty";
      reviewButton.disabled = !selectedText;
      forceReadableColors();
    });
  }

  function scheduleSelectionRefresh() {
    window.clearTimeout(selectionRefreshTimer);
    selectionRefreshTimer = window.setTimeout(refreshSelection, 100);
  }

  window.Asc.plugin.init = function () {
    selectionElement = document.getElementById("selection");
    reviewButton = document.getElementById("review");
    statusElement = document.getElementById("status");
    forceReadableColors();
    reviewButton.addEventListener("click", reviewSelection);
    window.Asc.plugin.attachEditorEvent("onTargetPositionChanged", scheduleSelectionRefresh);
    window.Asc.plugin.attachEditorEvent("onExternalMouseUp", scheduleSelectionRefresh);
    refreshSelection();
  };

  window.Asc.plugin.onThemeChanged = function (theme) {
    window.Asc.plugin.onThemeChangedBase(theme);
    forceReadableColors();
  };

  function reviewSelection() {
    if (!selectedText) return;
    reviewButton.disabled = true;
    setStatus("전체 문서 맥락과 선택 문장을 분석하는 중입니다.", false);
    window.Asc.plugin.executeMethod("ConvertDocument", ["markdown", false, false, false, false], async function (documentText) {
      try {
        var response = await fetch("http://localhost:3000/api/ai/selection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentText: documentText,
            selectedText: selectedText,
            question: document.getElementById("question").value
          })
        });
        var result = await response.json();
        if (!response.ok) throw new Error(result.error || "AI 검토에 실패했습니다.");

        var feedback = result.annotation || result.answer;
        window.Asc.plugin.executeMethod("AddComment", [{
          UserName: "Lab-BridGE AI",
          UserId: "labbridge-ai",
          QuoteText: selectedText,
          Text: feedback,
          Time: String(Date.now()),
          Solved: false,
          Replies: []
        }], function () {
          forceReadableColors();
          setStatus(result.answer, false);
          window.setTimeout(function () {
            window.Asc.plugin.executeMethod("ActivateWindow", ["iframe_asc.{6F3C2C96-5A8F-4DF0-B18B-5A58A9736C41}"]);
          }, 100);
        });
      } catch (error) {
        setStatus(error.message || "AI 검토에 실패했습니다.", true);
      } finally {
        reviewButton.disabled = false;
      }
    });
  }
})();
