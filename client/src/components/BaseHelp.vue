<template>
  <div class="centered-content">
    <h1 class="heading">Welcome to the UDConcord help pages!</h1>
    <img class="help" src="../assets/help.svg" />
    <div class="description">
      <p>
        If you are a user who is looking for some reference to learn how to use
        the UDConcord, you are in the right place. Please, check out the tabs
        below for topics of interest.
      </p>
    </div>
    <TabView class="pages">
      <TabPanel header="Uploading a File">
        The first step to use UDConcord is to upload a .conllu file, which
        should be the treebank to be processed. Users can do this on this page,
        which should have a blue button that says "Choose file". The user must
        click on that button to open a new window in which he/she will have to
        choose a file in their file system. This file (the treebank) must be in
        a valid .conllu format.
      </TabPanel>
      <TabPanel header="Searching Sententences">
        <figure class="fig">
          <img src="../assets/search-input.png" alt="" />
          <figcaption>Figure 1 - Search input</figcaption>
        </figure>
        After uploading the treebank, users can search for five different
        properties in the CoNLL-U file:
        <ul>
          <li>Forms;</li>
          <li>Lemmas;</li>
          <li>Part-of-speech tags (POS tags);</li>
          <li>Dependency relations (deprels);</li>
          <li>Features (feats).</li>
        </ul>
        The searched property can be selected with the selector highlighted in
        <span class="red-word">red</span> in figure 1.
        <br />
        <br />
        The search's case sensitivity can be selected with the selector
        highlighted in <span class="green-word">green</span>. Case sensitive
        searches differentiate between uppercase and lowercase text, while case
        insensitive searches do not.
        <br />
        <br />
        The input field highlighted in
        <span class="yellow-word">yellow</span> is where users should put their
        search terms. For example, if the user wants to look for tokens with the
        lemma "walk" in a treebank, he/she should select the lemma property in
        the selector highlighted in red and insert "walk" in the input field
        highlighted in yellow.
        <br />
        <br />
        To search for an n-gram, the user should insert the searched values
        separated by spaces. For example, to search for a 3-gram with the
        part-of-speech tags of PROPN VERB and NOUN, in that specific order, the
        user must enter "PROPN VERB NOUN" in the yellow input field and click
        the search button.
        <br />
        <br />
        To search for other properties (like dependency relationships and
        forms), the user must follow very similar steps as the ones described
        above. However, to search for features, the user must enter their search
        term in a special format. This format is clarified with the examples
        below:
        <ul>
          <li>
            "Gender=Fem": searches for tokens with the "Gender=Fem" feature;
          </li>
          <li>
            "Gender=Masc|Number=Sing": searches for tokens with both the
            "Gender=Masc" and "Number=Sing" feature;
          </li>
          <li>
            "Gender=Masc Number=Sing": searches for a two-gram, with the first
            token having a "Gender=Masc" and the second one having a
            "Number=Sing" feature
          </li>
          <li>
            "Gender": searches for a token with a "Gender" feature, no matter
            its value (the app returns tokens with "Gender=Masc" or "Gender=Fem"
            features);
          </li>
          <li>
            “Masc”: searches for a token with a feature with the value “Masc”,
            no matter its key (the app returns tokens with the features
            “Gender=Masc” or “Sing=Masc”, for example).
          </li>
        </ul>
        If the user clicks on the button highlighted in
        <span class="purple-word">purple</span> in figure 1, the app presents a
        few visualization options. The user can check the displayed boxes if
        he/she wants the indicated property to be shown in the search results.
        <br />
        <br />
        For example, by checking the "dependency relations" box before clicking
        the search button, the user is indicating that the app should display
        the matched tokens/n-grams' dependency relations in the search results.
        The app displays dependency relations in the following way:
        <figure class="fig">
          <img src="../assets/deprels.png" alt="" />
          <figcaption>
            Figure 2 - An example of a dependency relation
          </figcaption>
        </figure>
        The darker blue highlights the matched token/n-gram in a search and the
        dependent in the dependency relation. The number between parentheses is
        the token's head's id. Before the left parenthesis, there is also the
        label of the dependency relation. The lighter blue highlights the head
        of the dependency relation
        <br />
        <br />
        So, Figure 2 is indicating that there is a dependency relation of type
        "mark" between "tinha" (dependent) and "porque" (head). Also, note that
        each token has its id subscripted next to it.
      </TabPanel>
      <TabPanel header="Editing Sentence's CoNLL-U">
        After clicking on the "Search" button, the user should wait a little bit
        for the search to be completed. After that, the found sentences will be
        displayed, with the matched tokens/n-grams highlighted in blue.
        <br />
        <br />
        The user can navigate freely through the found sentences. Once the user
        spots a sentence that demands changes in its CoNLL-U, he/she can double
        click on it, and the app will open the CoNLL-U editor.
        <br />
        <br />
        The CoNLL-U editor is displayed in a table format. Users can edit cells
        and delete or add rows. These rows can have token data or metadata.
        Deleting/adding a row with token data is the same as deleting/adding a
        token from a sentence. To do it, the user must right-click on the row,
        then a pop-up window will be shown with options to delete the row or add
        a row above or below the one clicked.
        <br />
        <br />
        It's important to note that when deleting/adding a token, the ids, and
        the head column values are automatically adjusted to the change.
      </TabPanel>
      <TabPanel header="Downloading Sentences">
        On the results screen, there is a "Download" button at the bottom right.
        Clicking on the arrow inside the button shows a pop-up with the
        following options:
        <ul>
          <li>
            "Download treebank (.conllu)": clicking on it starts the download of
            the uploaded corpus, with every change made by the user;
          </li>
          <li>
            "Download search results (.conllu)": clicking on it starts the
            download of the CoNLL-U of every sentence returned by the search.
            This is great if you want to filter the CoNLL-U of only a few
            sentences.
          </li>
          <li>
            "Download search results (.csv)": clicking on it starts the download
            of the search results in a .csv format (not the CoNLL-U, just the
            sentences themselves);
          </li>
          <li>
            "Download search results (.txt)": clicking on it starts the download
            of the search results in a .txt format (not the CoNLL-U, just the
            sentences themselves);
          </li>
        </ul>
      </TabPanel>
    </TabView>
  </div>
</template>

<script>
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";

export default {
  components: {
    TabView,
    TabPanel,
  },
};
</script>

<style scoped>
.purple-word {
  color: purple;
}

.yellow-word {
  color: #cccc00;
}

.green-word {
  color: green;
}

.red-word {
  color: red;
}

.fig {
  text-align: center;
}

.pages {
  margin-top: 50px;
  text-align: justify;
  font-size: 18px;
  line-height: 1.6;
}

.description {
  color: #495057;
  font-size: 18px;
  text-align: left;
  line-height: 1.6;
}

.help {
  max-height: 350px;
  margin: 15px 0 50px 0;
}

.centered-content {
  font-family: "Roboto", sans-serif;
  text-align: center;
  width: 80%;
  margin-top: 130px;
}

.heading {
  font-size: 40px;
  font-weight: 700;
}
</style>
