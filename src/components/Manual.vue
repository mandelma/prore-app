<template>
    <MDBContainer>
    <div class="manual">
      <h3>Kasutusjuhend: ProKeikkatori Äpp</h3><br>


      Tere tulemast ProKeikkatori äppi kasutama! Käesolev juhend aitab teil samm-sammult mõista, kuidas kasutada äppi teenuste otsimiseks ja pakkumiseks.
      Juhend on jagatud kaheks: teenuse otsijatele ja teenuse pakkujatele. Lisaks toome välja, kuidas kasutada äppi mõlemas rollis samaaegselt.<br><br>

      <h4>Teenuse otsija juhend</h4><br>


      Kui otsite teenust, järgige alltoodud samme:<br><br>

      <h4>1. Registreerumine ja sisselogimine</h4>


      - Ava äpp ja vali avalehelt "otsi teenust?" (Otsid teenust?).<br>
      - Sisestage oma nimi, e-posti aadress ja looge parool. Vajutage "Registreeru".<br>
      - Kui olete juba kasutaja, valige "Logi sisse" ja sisestage oma andmed.<br><br>

      <h4>2. Teenuse otsimine</h4>


      - Pärast sisselogimist avaneb otsinguvaade.<br>
      - Sisestage otsinguväljale otsitava teenuse nimi või kategooria (nt "Torutööd").<br>
      - Kasutage kaardivaadet, et leida teie asukohale lähimad teenusepakkujad.<br><br>

      <h4>3. Teenuse broneerimine</h4>


      - Valige sobiv teenusepakkuja ja klõpsake tema profiilil.<br>
      - Lugege ülevaadet teenuse kohta ja kontrollige hindu.<br>
      - Vajutage "Broneeri teenus" ning kinnitage kuupäev ja kellaaeg.<br><br>

      <h4>Näide</h4>


      Otsite elektrikut. Sisestate otsingusse "Elektritööd" ja valite kaardil lähima teenusepakkuja.<br>
      Pärast profiili ülevaatamist broneerite aja järgmiseks päevaks.<br><br>

      <h4>Teenuse pakkuja juhend</h4>


      Kui soovite pakkuda teenuseid, järgige alltoodud juhiseid:<br><br>

      <h4>1. Registreerumine ja profiili loomine</h4>


      - Avalehel valige "Pakun teenust?" (Pakud teenust?).<br>
      - Sisestage oma nimi, e-posti aadress, looge parool ja valige "Registreeru".<br>
      - Täitke profiiliinfo: lisage oma teenuse kirjeldus, hinnakiri ja kontaktandmed.<br><br>

      <h4>2. Teenuste haldamine</h4>


      - Logige sisse ja avage menüü.<br>
      - Valige "Minu teenused" ja lisage uusi teenuseid, muutes vajadusel kirjeldusi või hindu.<br>
      - Kontrollige broneeringuid ja kinnitage need õigeaegselt.<br><br>

      <h4>3. Arveldamine</h4>


      - Teenuse pakkumine on tasuline. Makske kuutasu läbi äpi "Makse" menüüpunkti.<br>
      - Makseid saab teha turvaliselt läbi erinevate maksemeetodite.<br><br>

      <h4>Näide</h4>


      Olete torumees ja soovite pakkuda oma teenuseid. Loote profiili, lisate teenuse "Veelekete parandamine" ja määrate hinnaks 50 €/tund.<br>
      Klient broneerib teie teenuse järgmiseks nädalaks.<br><br>

      <h4>Teenuse otsija ja pakkuja samaaegne kasutus</h4>


      Kui soovite kasutada äppi nii teenuse otsimiseks kui ka pakkumiseks:<br>
      - Registreeruge esmalt ühes rollis (nt teenuse pakkujana).<br>
      - Logige sisse ja lisage oma profiilile teine roll ("Lisa teenuse otsija").<br>
      - Mõlemad rollid on kasutatavad ühe konto alt, kuid teenuse pakkumine jääb tasuliseks.<br><br>

      <h4>Tähtsad märkused</h4>


      - Teenuse otsimine on tasuta, kuid teenuse pakkumine on tasuline.<br>
      - Kõik kaebused ja küsimused palume saata e-posti aadressile: prokeikkatori@gmail.com.
    </div>
  </MDBContainer>
</template>
<script setup>
    import { MDBContainer } from 'mdb-vue-ui-kit'
    defineOptions({
        name: 'manual'
    });

</script>
<style scoped>
.manual {
  text-align: left;

}
.manual h3 {
  color: #799ddf;

}
.manual h4 {
  color: #5682af;
}
.manual p {
  color: #ddd;
  font-size: 14px;
}
</style>