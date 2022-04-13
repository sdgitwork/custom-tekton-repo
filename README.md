# **Tekton**
Cloud native CI/CD, realisiert durch CRD's. Tekton hat unterschiedeliche Bestandteile, aus denen Build Pipelines zusammengesetzt sind.

## **Tasks** 
sind einzelne Build Blöcke, aus denen die Pipeline zusammengesetzt ist. EinTask sollte möglichst eine Aufgabe (Repo klonen, Tests laufen lassen) haben undmöglichst wiederverwendbar geschrieben sein, sodass man ihn in mehrfach einsetzen kann.

Jeder einzelne Task wird in einem **Pod** ausgeführt, der solange läuft, bis alle Stepserfolgreich abgearbeitet wurden oder eine Step failt.
Ein Task wird in einem YAML File definiert (apiVersion, kind, metadata und spec). In der spec Section werden die Elemente definiert, die man zum ausführen der Aufgabe desTasks benötigt (parameters, workspaces, results oder steps).

**Steps** sind das kleinste Element in Tekton und müssen für die Erstellng einesTaskszwingend angegeben werden. Steps werden in dem YAML File des jew. Tasks in derspecSection definiert. Jeder step wird durch einen Container ausgeführt, weshalb dieAngabedes Images zwingend ist. 

apiVersion: tekton.dev/v1beta1

kind: Task
metadata: 
  name: example-task
spec: 
  steps: 
    - name: step-one 
      image: ubuntu
      command:
        - bin/bash
      args: ["-c", "echo hello world"]
    - name: step-two
      image: registry.access.redhat.com/ubi8/ubi
      script: |
        #!/usr/bin/env bash
        echo "Installing necessary tooling"
        dnf install iputils -y
        ping redhat.com -c 5
        echo "All done!"  

## **Pipeline**

Um eine Applikation zu builden, macht man sich eine Pipeline zu nutze, in der man mehrere Tasks ausführt. Der Aufbau des YAML Files ist äquivalent zu dem eines Tasks. Nur dass hier in der spec section keine steps, sondern die tasks aufgerufen werden. Hierbei ist zu beachten, dass per default die Tasks in einer random Reihenfolge ausgeführt werden (wenn sie in Reihenfolge abgearbeitet werden, sollen "runAfter" flag benutzen). 
Wenn man mit den Tekton CLI Tool eine Pipieline starten will, wird im Hintergrund ein PipelineRun ausgeführt. Um benötigte Parameter etc. nicht jedes mal von selbst eingeben zu müssen, muss man Pipelineruns (auch in YAML's) erstellen. 


## **Daten in innerhalb Tasks und Pipelines teilen**
Es gibt verschiedene Methoden; man kann bspw. zwischen mehreren steps in einem Task Daten teilen, indem man Nachrichten in einem bestimmten **Pfad des Pods** schreibt. Man kann kann in der spec section eines Tasks **results** definieren, wobei hierin Daten eines Steps gespeichert werden und dann zwischen verschiedenen Steps geteilt werden können. Man kann standardmäßig **Volumes** nehmen; diese muss man dann ebenfalls in der spec section definieren. Der beste in Tekton, um Daten zu teilen, sind **workspaces**, die einem erlauben, verschieden Arten von Volumes zwischen mehreren steps eines tasks zu teilen.

# **Tekton Triggers**
Um **Tekton-Pipelines automatisiert** ablaufen zu lassen, sind zwei Erweiterungen (**C**ustom**R**esource**D**efinitions) erforderlich; Tekton **Triggers** (kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/release.yaml) und Tekton **Interceptors** (kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/interceptors.yaml). 

Mit **Triggern** ist es möglich, eingehende Webhooks im Cluster entgegen zu nehmen und entsprechende Reaktionen damit auszulösen.

**Interceptors** werden dazu benutzt, um eingehende Webhooks zu filtern und zu validieren (Bsp. -> kommt der Webhook, wie erwartet bspw. wie erwartet von GitHub/-Lab...). Zu den Standard Interceptors zählen GitHub, Gitlab, Bitbucket, and Common Expression Language (CEL).

## **Komponenten und Ablauf**
Da Tekton Kubernetes Objekte instanziiert, wird ein **Serviceaccount mit RBAC** benötigt (siehe bspw. kubectl apply -f https://raw.githubusercontent.com/tektoncd/triggers/main/examples/rbac.yaml).  

Um es externen Services zu ermögliche, die **Trigger** zu erreichen (bzw. Webhooks an die Trigger zu senden), müssen diese **der Außenwelt zugänglich** gemacht werden. Für Cluster in der Cloud kann man Ingress Ressourcen erstellen, für lokale Cluster muss man auf weitere Tools wie bspw. ngrok zurückgreifen.

Wenn ein Trigger ausgelöst wird, wird folgender Prozess gestartet:

Event -> EventListenerPod (triggerBinding -> (Params) -> triggerTemplate) -> CREATE RESOURCE!

Es kommt zu einer definierten Änderung in einem Repository (wie bspw. ein Push oder Pull-**Event**). Der **Eventlistener**, welcher auf eingehende HTTP Requests mit JSON Payload wartet, registriert diesen Event, woraufhin der Trigger ausgelöst wird. In der yaml Definition des EventListeners wird dann das Triggerbinding mit dem Triggertemplate verbunden.

Das **Triggerbinding** ist dem Triggertemplate vorgeschaltet und extrahiert Informationen aus dem eingehenden Request (dem Webhook Payload). Indem es Informationen aus dem Request in Parameter speichert, kann das Triggertemplate diese verwenden (Informationen hierbei können bspw. der Name des Branches, des Commiters, Repositorys (-> alle möglichen Information aus dem Payload des Webhooks) sein). Wichtig hierbei ist, dass der Parameter im Template und im Binding denselben Namen haben. Durch die Seperation des Triggerbindings und -templates kann ein Triggerbinding von mehreren, unterschiedlichen Triggertemplates verwendet werden.
 
Das **Triggertemplate** ist eine Vorlage dafür, was passieren soll, wenn der Trigger ausgelöst wurde. Sie beschreibt also, welche Pipeline ausgelöst (getriggert) werden soll.

# TKN CLI
Durch das CMD Tool von Tekton können Operationen im Zusammenhang mit Tekton einfacher ausgeführt werden. 
**CHEAT CHEAT**
- tkn pipeline start <pipeline-name> // Startet definierte Pipeline
- tkn task start <task-name> // Startet definierten Task
- tkn <task/pipeline> start <pipeline-/task-name> --shwolog // Startet definiertes Objekt und zeigt logs zur Laufzeit an
- tkn <task/pipeline> ls // Auflistung aller spezifizierten Objekte
- tkn <pipelinerun/taskrun> cancel <name> // erzwungenes Abbrechen eines Runs
