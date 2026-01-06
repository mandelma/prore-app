<template>
    <MDBContainer >
    <div class="rules" >

      <h3>Privaatsuspoliitika ja Kasutustingimused</h3><br>

      <h4>Privaatsuspoliitika</h4>


      <p>Käesolev privaatsuspoliitika kirjeldab, kuidas me kogume, kasutame ja kaitseme teie isikuandmeid seoses meie veebirakenduse kasutamisega.
      Oleme pühendunud teie andmete kaitsmisele ja töötlemisele kooskõlas Euroopa Liidu üldise andmekaitsemäärusega (GDPR).</p><br>

      <h4>1. Kogutavad andmed</h4>


      Kogume järgmisi andmeid:<br>
      - Kasutaja nimi ja kontaktandmed (nt e-post).<br>
      - Teenuse pakkuja puhul lisainformatsioon, nagu ettevõtte nimi ja arveldusandmed.<br>
      - Kasutajate tegevused äpis (nt otsingu- ja broneerimisajalugu).<br><br>

      <h4>2. Andmete kasutamine</h4>


      Teie andmeid kasutatakse järgmistel eesmärkidel:<br>
      - Teenuste osutamiseks ja äpi funktsioonide pakkumiseks.<br>
      - Klienditoe pakkumiseks.<br>
      - Arveldamiseks (teenuse pakkujate puhul).<br>
      - Äpi täiustamiseks ja statistilisteks analüüsideks.<br><br>

      <h4>3. Andmete jagamine</h4>


      Teie andmeid ei jagata kolmandate osapooltega ilma teie selge nõusolekuta, välja arvatud juhul, kui see on vajalik seadusjärgsete nõuete täitmiseks.<br><br>

      <h4>4. Andmete säilitamine</h4>


      Teie andmeid säilitatakse ainult seni, kuni see on vajalik käesolevas privaatsuspoliitikas kirjeldatud eesmärkide täitmiseks, välja arvatud juhul,
      kui seadus nõuab pikemat säilitamist.<br><br>

      <h4>5. Teie õigused</h4>


      Teil on õigus:<br>
      - Juurdepääsule oma andmetele.<br>
      - Nõuda andmete parandamist või kustutamist.<br>
      - Võtta tagasi oma nõusolek andmete töötlemiseks.<br>
      - Esitada kaebus järelevalveasutusele.<br><br>

      <h4>6. Kontaktandmed</h4>


      Kui teil on küsimusi privaatsuspoliitika kohta, võtke meiega ühendust e-posti teel: prokeikkatori@gmail.com.<br><br>

      <h4>Kasutustingimused</h4>


      Käesolevad kasutustingimused reguleerivad veebirakenduse kasutamist. Palun lugege need hoolikalt läbi enne rakenduse kasutamist.<br>

      1. Teenuse kirjeldus<br>


      Äpp võimaldab kasutajatel otsida teenuseid ja teenusepakkujatel pakkuda oma teenuseid tasu eest.<br><br>

      <h4>2. Kasutaja kohustused</h4>


      Kasutaja kohustub:<br>
      - Esitama tõeseid andmeid.<br>
      - Mitte kuritarvitama äppi ega kahjustama teisi kasutajaid.<br>
      - Järgima kõiki kohalikke seadusi.<br><br>

      <h4>3. Vastutuse piiramine</h4>


      Äpp ei vastuta teenusepakkujate poolt osutatud teenuste kvaliteedi ega kasutajate vaheliste tehingute eest.
      Kasutajad vastutavad oma tegevuse eest ise.<br><br>

      <h4>4. Kaebuste lahendamine</h4>


      Kaebuste ja küsimuste korral võtke meiega ühendust e-posti teel: prokeikkatori@gmail.com.
    </div>
  </MDBContainer>
</template>
<script setup>
    import { MDBContainer } from 'mdb-vue-ui-kit'
    defineOptions({
        name: 'rules'
    });
</script>
<style scoped>
.rules {
  text-align: left;

}
.rules h3 {
  color: #799ddf;

}
.rules h4 {
  color: #5682af;
}
.rules p {
  color: #ddd;
  font-size: 14px;
}
</style>