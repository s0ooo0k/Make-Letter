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

  const GEMINI_API_KEY = "";
  const model = "gemini-2.0-flash-thinking-exp-01-21";

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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `${position}은 이 사람의 직업이자, 지원하고 싶은 분야야. 경력은 몇 년 일했는지에 따라 다르고 ${career}이고, ${briefing}의 내용을 기반으로 자기소개서를 만들거야. 그 전에 이 내용을 bullet point로 간단하게 정리하려고 해.

    - 핵심 기술 및 스킬 요약
    - 주요 업무 경험
    - 자기소개서에서 강조할 부분

    로 정리해줘. 자기소개서는 작성하지마. 위의 3개의 bullet point만 각각 100자 이내로 작성해줘. 따로 제목 메세지 없이, 그냥 bullet point 내용만 보여주면 돼. ##이나 ** 같은 마크다운 언어는 모두 지우고, 평문으로만 작성해줘.`;

    // 예외 처리
    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Bullet Point 생성 실패", error);
      throw new Error("Bullet Point 생성 실패");
    }
  };

  // [Chain 2 함수] Chain 1의 Bullet Point를 바탕으로 자기소개 생성
  const makeLetter = async (bulletPoint) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `${bulletPoint}의 바탕으로 500자 내외의 자기소개서를 작성해줘. 마크다운을 사용하지 않고, 평문 한국어로만 작성해줘. Bullet Point를 요약한 내용은 출력하지 않아도 되고, 자기소개서만 출력해줘.`;

    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("자기소개서 생성 실패", error);
      throw new Error("자기소개서 생성 실패");
    }
  };

  // [Chain 3] 영어 번역하기
  const translate = async (text) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `Translate the following Korean text into English. Don't change Anything :
    ${text}. `;

    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.candidates[0].content.parts[0].text;
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
        const translateText = await translate(letter);
        btn.remove();
        addMsg("[English Translation]\n" + translateText);
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
      addMsg("[Bullet Point]\n" + bulletPoint);

      showMessage();
      // Chain 2
      const letter = await makeLetter(bulletPoint);
      removeMessage();
      addMsg("[자기소개서]\n" + letter);

      addTranslate(letter);
    } catch (error) {
      addMsg("에러 발생" + error.message);
    } finally {
      hideSp();
    }
  });
});
