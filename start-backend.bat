@echo off
if exist "C:\Program Files\Java\jdk-17\bin\java.exe" set "JAVA_HOME=C:\Program Files\Java\jdk-17"
cd /d "%~dp0backend"
echo ===================================================
echo Starting Dukan AI Backend (Spring Boot + MySQL)
echo ===================================================
if exist "mvnw.cmd" (
	call mvnw.cmd spring-boot:run
) else (
	mvn spring-boot:run
)
pause
