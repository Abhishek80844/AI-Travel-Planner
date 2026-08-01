@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed me under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------

@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%
@if "%MAVEN_BATCH_ECHO%" == "" echo off

set ERROR_CODE=0

set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
if "%MAVEN_PROJECTBASEDIR%" == "" set MAVEN_PROJECTBASEDIR=%~dp0

for %%i in ("%MAVEN_PROJECTBASEDIR%") do set MAVEN_PROJECTBASEDIR=%%~fi

if not "%MAVEN_PROJECTBASEDIR%" == "" goto stripTrailingSlash
goto init

:stripTrailingSlash
if "%MAVEN_PROJECTBASEDIR:~-1%" == "\" set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%
if "%MAVEN_PROJECTBASEDIR:~-1%" == "\" goto stripTrailingSlash

:init
set MAVEN_CMD_LINE_ARGS=%*

if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
goto error

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE="%JAVA_HOME%\bin\java.exe"

if exist %JAVA_EXE% goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
goto error

:execute
@REM Find the wrapper jar
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if exist %WRAPPER_JAR% goto runWrapper

@REM Download wrapper jar if missing
set DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR%')"


:runWrapper
%JAVA_EXE% -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" -classpath %WRAPPER_JAR% %WRAPPER_LAUNCHER% %MAVEN_CMD_LINE_ARGS%
if "%ERRORLEVEL%"=="0" goto end
goto error


:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%
