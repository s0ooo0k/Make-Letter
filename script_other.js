document.addEventListener("DOMContentLoaded", async () => {
  // form
  const addMsg = (msg) => {
    const box = document.querySelector("#content-box");

    box.style.innerHTML = "";
    box.style.opacity = "1";

    const loadingMsg = document.querySelector("#loadSpn");
    if (loadingMsg) {
      loadingMsg.style.display = "none";
    }

    const p = document.createElement("p");
    p.innerHTML = msg.replace(/\n/g, "<br>");
    box.appendChild(p);
  };

  // form
  const form = document.querySelector("#controller");

  // const GEMINI_API_KEY = "";

  // spinner
  const showSp = () => {
    document.querySelector("#loadSpn").style.display = "block";
  };
  const hideSp = () => {
    document.querySelector("#loadSpn").style.display = "none";
  };

  // spinner 2 (자기소개 생성 중)
  const showMessage = () => {
    const contentBox = document.querySelector("#content-box");
    const p = document.createElement("p");
    p.id = "load-message";
    p.textContent = "📝 자기소개서 생성 중...";
    p.style.fontWeight = "bold";
    p.style.textAlign = "center";
    p.style.marginTop = "10px";
    contentBox.appendChild(p);
  };

  const removeMessage = () => {
    const loadMessage = document.querySelector("#load-message");
    if (loadMessage) {
      loadMessage.remove();
    }
  };
  // Chain 1, 2, 3 함수를 각각 만든 후 submit과 관련된 EventListner를 만들어 함수를 호출

  // [Chain 1 함수] Bullet Point 형식으로 정리하기
  const makePoint = async (position, career, briefing) => {
    const url = `https://tidal-important-platypus.glitch.me/otherbulletPoint`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ position, career, briefing }),
      });
      const json = await response.json();
      return json.bulletPoint;
    } catch (error) {
      console.error("Bullet Point 생성 실패", error);
      throw new Error("Bullet Point 생성 실패");
    }
  };

  // [Chain 2 함수] Chain 1의 Bullet Point를 바탕으로 자기소개 생성
  const makeLetter = async (bulletPoint) => {
    const url = `https://tidal-important-platypus.glitch.me/letter`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulletPoint }),
      });
      const json = await response.json();
      return json.letter;
    } catch (error) {
      console.error("자기소개서 생성 실패", error);
      throw new Error("자기소개서 생성 실패");
    }
  };

  // [Chain 3] 영어 번역하기
  const translate = async (letter) => {
    const url = `https://tidal-important-platypus.glitch.me/translate`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter }),
      });

      if (!response.ok) throw new Error(`번역 실패: ${response.status}`);

      const json = await response.json();
      return json.translatedLetter;
    } catch (error) {
      console.error("번역 실패", error);
      throw new Error("번역 실패");
    }
  };

  // [3-1] 영어 번역 후 출력
  const addTranslate = (letter) => {
    const contentBox = document.getElementById("content-box");

    if (document.getElementById("translate-btn")) return;

    const btn = document.createElement("button");
    btn.id = "translate-btn";
    btn.textContent = "🔄 영어 번역";
    btn.className = "btn btn-secondary";
    btn.style.marginTop = "15px";
    btn.onclick = async () => {
      btn.textContent = "🔄 번역 중...";
      btn.disabled = true;

      try {
        const translatedLetter = await translate(letter);
        btn.remove();
        addMsg("[🆎 English Translation]\n" + translatedLetter);
      } catch (error) {
        addMsg("번역 중 오류 발생: " + error.message);
      } finally {
        btn.textContent = "🔄 영어 번역";
        btn.disabled = false;
      }
    };
    contentBox.appendChild(btn);
  };

  // addEventListner로 호출
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 새로 제출했을 때..
    const contentBox = document.querySelector("#content-box");
    contentBox.innerHTML = "";
    contentBox.style.opacity = "0";

    const formData = new FormData(form);
    // form Data
    const position = formData.get("position");
    const career = formData.get("career");
    const briefing = formData.get("briefing");

    showSp();

    // Chain 1, 2 실행
    try {
      // Chain 1
      const bulletPoint = await makePoint(position, career, briefing);
      addMsg("[🖊️핵심 3줄 요약]\n" + bulletPoint);

      showMessage();
      // Chain 2
      const letter = await makeLetter(bulletPoint);
      removeMessage();
      addMsg("[😄 자기소개서]\n" + letter);

      addTranslate(letter);
    } catch (error) {
      addMsg("에러 발생" + error.message);
    } finally {
      hideSp();
    }
  });
});
