# Interface Sonore

!!! warning "TODO"

* TTS / STT
	* Comment interfacer les méthodes existantes basées sur des CNN ou des Transformers avec mon modèle symbolique sémantique qui fournit également des informations **top-down** en fonction des concepts en contexte ?
		* Développer et entraîner mon propre modèle ? :scream:

* Phonèmes
	* Entraînement sur des bandes sonores, notamment pour les élisions
	* L'algo d'apprentissage serait probablement très adapté pour cette tâche !
		* C'est en fait très semblable à la tâche d'apprentissage qui consiste à trouver les règles qui régissent le fait qu'on utilise tel phonème en face de tel groupe de lettres, etc.
* Comment encoder le ton sans passer par des méthodes totalement *end-to-end* comme dans les démos d'OpenAI ?
	* Ces abrutis ont apparemment développé un modèle qui va de la voix au son en un seul gros bloc !
	* Du coup, la diction est vraiment très naturelle mais par contre le modèle de langage et la base de faits qui est au beau milieu de cet assemblage est encore moins scrutable et débuggable !

