
import React from 'react';
import PCAStatsCards from '../components/PCA/PCAStatsCards';
import PCAHeader from '../components/PCA/PCAHeader';
import PCAApprovedDFDsList from '../components/PCA/PCAApprovedDFDsList';
import DFDApprovalModal from '../components/PCA/DFDApprovalModal';
import CancellationRequestsModal from '../components/PCA/CancellationRequestsModal';
import PCAVisualizationModal from '../components/PCA/PCAVisualizationModal';
import RemoveFromPCAModal from '../components/PCA/RemoveFromPCAModal';
import PCAStructuredExportModal from '../components/PCA/PCAStructuredExportModal';
import DFDViewModal from '../components/DFD/DFDViewModal';
import { consolidateItemsByType } from '../utils/pcaConsolidation';
import { usePCAData } from '../hooks/usePCAData';

const PCA = () => {
  const {
    selectedYear,
    setSelectedYear,
    showPendingModal,
    setShowPendingModal,
    showCancellationModal,
    setShowCancellationModal,
    showPCAModal,
    setShowPCAModal,
    showDFDViewModal,
    setShowDFDViewModal,
    showRemoveModal,
    setShowRemoveModal,
    showExportModal,
    setShowExportModal,
    selectedDFD,
    setSelectedDFD,
    dfdToRemove,
    setDFDToRemove,
    pcaPublished,
    setPcaPublished,
    approvedDFDs,
    pendingDFDs,
    cancellationRequests,
    mockConsolidatedItems,
    totalItens,
    valorTotal,
    handleViewDFD,
    handleApproveDFD,
    handleRejectDFD,
    handleApproveCancellation,
    handleDenyCancellation,
    handleRemoveFromPCA,
    handleConfirmRemoval,
    handlePublishPNCP
  } = usePCAData();

  const consolidatedItemsByType = consolidateItemsByType(mockConsolidatedItems);

  return (
    <div className="space-y-6">
      <PCAHeader
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        pcaPublished={pcaPublished}
        onExportClick={() => setShowExportModal(true)}
        onVisualizeClick={() => setShowPCAModal(true)}
        onPublishClick={handlePublishPNCP}
      />

      {/* Cards de Estatísticas */}
      <PCAStatsCards
        selectedYear={selectedYear}
        totalItens={totalItens}
        valorTotal={valorTotal}
        pendentesAprovacao={pendingDFDs.length}
        solicitacoesCancelamento={cancellationRequests.length}
        onPendentesClick={() => setShowPendingModal(true)}
        onSolicitacoesClick={() => setShowCancellationModal(true)}
      />

      <PCAApprovedDFDsList
        selectedYear={selectedYear}
        approvedDFDs={approvedDFDs}
        onViewDFD={handleViewDFD}
        onRemoveFromPCA={handleRemoveFromPCA}
      />

      {/* Modais */}
      <DFDApprovalModal
        open={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        pendingDFDs={pendingDFDs}
        onView={handleViewDFD}
        onApprove={handleApproveDFD}
        onReject={handleRejectDFD}
      />

      <CancellationRequestsModal
        open={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        cancellationRequests={cancellationRequests}
        onView={handleViewDFD}
        onApprove={handleApproveCancellation}
        onDeny={handleDenyCancellation}
      />

      <PCAVisualizationModal
        open={showPCAModal}
        onClose={() => setShowPCAModal(false)}
        selectedYear={selectedYear}
        itemsByType={consolidatedItemsByType}
      />

      <PCAStructuredExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        itemsByType={consolidatedItemsByType}
        selectedYear={selectedYear}
      />

      <RemoveFromPCAModal
        open={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        dfd={dfdToRemove}
        onConfirm={handleConfirmRemoval}
      />

      <DFDViewModal
        open={showDFDViewModal}
        onClose={() => setShowDFDViewModal(false)}
        dfd={selectedDFD}
      />
    </div>
  );
};

export default PCA;
