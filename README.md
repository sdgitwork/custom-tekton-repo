# **Tekton Triggers**
Um **Tekton-Pipelines automatisiert** ablaufen zu lassen, sind zwei Erweiterungen (**C**ustom**R**esource**D**efinitions) erforderlich; Tekton **Triggers** (kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/release.yaml) und Tekton **Interceptors** (kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/interceptors.yaml). 

Mit **Triggern** ist es möglich, eingehende Webhooks im Cluster entgegen zu nehmen und entsprechende Reaktionen damit auszulösen.

**Interceptors** werden dazu benutzt, um eingehende Webhooks zu filtern und zu validieren (Bsp. -> kommt der Webhook, wie erwartet bspw. wie erwartet von GitHub/-Lab...). Zu den Standard Interceptors zählen GitHub, Gitlab, Bitbucket, and Common Expression Language (CEL).

## **Komponenten und Ablauf**
Da Tekton Kubernetes Objekte instanziiert, wird ein **Serviceaccount mit RBAC** benötigt (siehe bspw. kubectl apply -f https://raw.githubusercontent.com/tektoncd/triggers/main/examples/rbac.yaml).  

Um es externen Services zu ermögliche, die **Trigger** zu erreichen (bzw. Webhooks an die Trigger zu senden), müssen diese **der Außenwelt zugänglich** gemacht werden. Für Cluster in der Cloud kann man Ingress Ressourcen erstellen, für lokale Cluster muss man auf weitere Tools wie bspw. ngrok zurückgreifen.

Wenn ein Trigger ausgelöst wird, wird folgender Prozess gestartet:

Event -> EventListenerPod (triggerBinding -> (Params) -> triggerTemplate) -> END..

Es kommt zu einer definierten Änderung in einem Repository (wie bspw. ein Push oder Pull-**Event**). Der **Eventlistener**, welcher auf eingehende HTTP Requests mit JSON Payload wartet, registriert diesen Event, woraufhin der Trigger ausgelöst wird. In der yaml Definition des EventListeners wird dann das Triggerbinding mit dem Triggertemplate verbunden.

Das **Triggerbinding** ist dem Triggertemplate vorgeschaltet und extrahiert Informationen aus dem eingehenden Request (dem Webhook Payload). Indem es Informationen aus dem Request in Parameter speichert, kann das Triggertemplate diese verwenden (Informationen hierbei können bspw. der Name des Branches, des Commiters, Repositorys (-> alle möglichen Information aus dem Payload des Webhooks) sein). Wichtig hierbei ist, dass der Parameter im Template und im Binding denselben Namen haben. Durch die Seperation des Triggerbindings und -templates kann ein Triggerbinding von mehreren, unterschiedlichen Triggertemplates verwendet werden.
 
Das **Triggertemplate** ist eine Vorlage dafür, was passieren soll, wenn der Trigger ausgelöst wurde. Sie beschreibt also, welche Pipeline ausgelöst (getriggert) werden soll.