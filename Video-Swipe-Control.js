// ==UserScript==
// @name         Video Swipe Control & Feedback
// @namespace    http://tampermonkey.net/
// @version      3.1.1
// @description  Control video playback with swipe gestures in fullscreen, ensuring reliable feedback and accurate video control
// @author       Brooo-ooo
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 설정 가능한 변수들
    const sensitivity = 50; // 스와이프 민감도 설정
    const timeSensitivity = 0.2; // 타임라인 이동 민감도
    let videoElement = null;
    let isSwiping = false;

    // 시간 형식 변환 함수 (초 -> 시:분:초)
    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
	
	// 시간 형식 변환 함수 (초 -> 분:초)
	function formatTime2(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}


    // 화면 정중앙에 피드백 표시 DOM 요소 생성
    const feedbackDiv = document.createElement('div');
    feedbackDiv.style.position = 'fixed';
    feedbackDiv.style.top = '75%';
    feedbackDiv.style.left = '50%';
    feedbackDiv.style.transform = 'translate(-50%, -50%)';
    feedbackDiv.style.padding = '10px';
    feedbackDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    feedbackDiv.style.color = '#fff';
    feedbackDiv.style.fontSize = '12px';
    feedbackDiv.style.borderRadius = '8px';
    feedbackDiv.style.zIndex = '9999';
    feedbackDiv.style.textAlign = 'center';
    feedbackDiv.style.display = 'none';
    document.body.appendChild(feedbackDiv);

    // 비디오 요소 찾기
    function findVideoElement() {
        videoElement = document.querySelector('video');
    }

    // 전체화면 확인 함수
    function isFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    // 피드백 업데이트 함수
    function updateFeedback(deltaX) {
        if (!videoElement || !isSwiping) return;

        // 이동 시간 계산
        const timeChange = deltaX * timeSensitivity;
        const currentTime = Math.min(Math.max(videoElement.currentTime + timeChange, 0), videoElement.duration);
        const totalDuration = videoElement.duration;

        // 피드백 내용 설정
		feedbackDiv.style.whiteSpace = 'pre-line'; // 줄바꿈을 허용하도록 스타일 변경
        feedbackDiv.textContent = `${formatTime2(Math.abs(timeChange))}\n${formatTime(currentTime)} / ${formatTime(totalDuration)}`;
    }

    // 이벤트 리스너 등록
    let startX = 0;

    document.addEventListener('touchstart', (event) => {
        findVideoElement();
        if (!videoElement || !isFullscreen()) return; // 전체화면이 아닌 경우 스와이프 무시

        isSwiping = true;
        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
        if (fullscreenElement) {
            fullscreenElement.appendChild(feedbackDiv);
        } else {
            document.body.appendChild(feedbackDiv);
        }

        const touch = event.touches[0];
        startX = touch.clientX;
        feedbackDiv.style.display = 'block'; // 피드백 활성화
    });

    document.addEventListener('touchmove', (event) => {
        if (!videoElement || !isFullscreen() || !isSwiping) return;

        event.preventDefault(); // 브라우저 기본 제스처 방지
        const touch = event.touches[0];
        const deltaX = touch.clientX - startX;

        updateFeedback(deltaX); // 실시간 피드백 업데이트
    });

    document.addEventListener('touchend', (event) => {
        if (!videoElement || !isFullscreen() || !isSwiping) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX;

        // 타임라인 업데이트
        const timeChange = deltaX * timeSensitivity;
        videoElement.currentTime = Math.min(Math.max(videoElement.currentTime + timeChange, 0), videoElement.duration);

        feedbackDiv.style.display = 'none'; // 피드백 숨김
        isSwiping = false; // 스와이프 종료
    });

    // 전체화면 상태 변경 처리
    document.addEventListener('fullscreenchange', findVideoElement);
    document.addEventListener('webkitfullscreenchange', findVideoElement);
})();
